import { useState, useCallback, useRef, useEffect } from "react";
import { AnalysisResult } from "@/types/analysis";
import { CapturedPhotos } from "@/components/screens/CaptureScreen";
import { QuestionnaireData } from "@/components/Questionnaire";
import { supabase } from "@/integrations/supabase/client";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024; // 4MB
const COOLDOWN_KEY = 'hairline_last_analyze_at';
const MIN_COOLDOWN_MS = 10000; // 10 seconds

export type ErrorType = 'payload_too_large' | 'rate_limit' | 'server_error' | 'network_error' | 'cooldown';

interface UseAnalysisReturn {
  isAnalyzing: boolean;
  error: string | null;
  errorType: ErrorType | null;
  usedSinglePhoto: boolean;
  cooldownRemaining: number;
  rateLimitWait: number;
  analyze: (photos: CapturedPhotos, questionnaire: QuestionnaireData) => Promise<AnalysisResult | null>;
  retry: () => Promise<AnalysisResult | null>;
  clearError: () => void;
}

// Compress and resize a photo to reduce payload size
async function compressPhoto(dataUrl: string, maxWidth: number = 640, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

// Get byte size of a data URL
function getDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

// Get last analyze timestamp from localStorage
function getLastAnalyzeAt(): number {
  try {
    const val = localStorage.getItem(COOLDOWN_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

// Save last analyze timestamp to localStorage
function setLastAnalyzeAt(timestamp: number): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(timestamp));
  } catch {
    // Ignore storage errors
  }
}

export function useAnalysis(): UseAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [usedSinglePhoto, setUsedSinglePhoto] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [rateLimitWait, setRateLimitWait] = useState(0);

  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{ photos: CapturedPhotos; questionnaire: QuestionnaireData } | null>(null);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Update cooldown countdown
  useEffect(() => {
    const updateCooldown = () => {
      const lastAt = getLastAnalyzeAt();
      const elapsed = Date.now() - lastAt;
      const remaining = Math.max(0, Math.ceil((MIN_COOLDOWN_MS - elapsed) / 1000));
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update rate limit countdown
  useEffect(() => {
    if (rateLimitWait <= 0) return;

    const interval = setInterval(() => {
      setRateLimitWait(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitWait]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
    setRateLimitWait(0);
  }, []);

  const analyze = useCallback(async (
    photos: CapturedPhotos,
    questionnaire: QuestionnaireData
  ): Promise<AnalysisResult | null> => {
    // Prevent double-clicks and re-entry
    if (inFlightRef.current) {
      return null;
    }

    // Check cooldown
    const lastAt = getLastAnalyzeAt();
    const elapsed = Date.now() - lastAt;
    if (elapsed < MIN_COOLDOWN_MS) {
      const waitSec = Math.ceil((MIN_COOLDOWN_MS - elapsed) / 1000);
      setError(`Please wait ${waitSec}s before trying again`);
      setErrorType('cooldown');
      return null;
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError('App configuration error. Please reinstall the app.');
      setErrorType('network_error');
      return null;
    }

    // Lock immediately
    inFlightRef.current = true;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // 2-minute fetch timeout — Gemini 2.5 Flash (thinking model) can take 30-90s
    const fetchTimeoutId = setTimeout(() => abortRef.current?.abort(), 120000);

    setIsAnalyzing(true);
    setError(null);
    setErrorType(null);
    setUsedSinglePhoto(false);
    setRateLimitWait(0);
    lastRequestRef.current = { photos, questionnaire };

    try {
      const photoArray = [photos.front, photos.left, photos.right].filter(Boolean) as string[];

      if (photoArray.length === 0) {
        setError('No photos to analyze');
        setErrorType('network_error');
        inFlightRef.current = false;
        setIsAnalyzing(false);
        return null;
      }

      // Compress photos
      let compressedPhotos = await Promise.all(
        photoArray.map(photo => compressPhoto(photo, 640, 0.7))
      );

      let photosToSend = compressedPhotos;
      let totalSize = compressedPhotos.reduce((sum, p) => sum + getDataUrlSize(p), 0);

      // If still too large, try more aggressive compression
      if (totalSize > MAX_PAYLOAD_SIZE) {
        compressedPhotos = await Promise.all(
          photoArray.map(photo => compressPhoto(photo, 480, 0.5))
        );
        totalSize = compressedPhotos.reduce((sum, p) => sum + getDataUrlSize(p), 0);
        photosToSend = compressedPhotos;
      }

      // If still too large after aggressive compression, use single photo
      if (totalSize > MAX_PAYLOAD_SIZE) {
        photosToSend = [compressedPhotos[0]];
        setUsedSinglePhoto(true);
      }

      // Get user JWT if available, fall back to anon key
      let authToken = SUPABASE_ANON_KEY;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authToken = session.access_token;
        }
      } catch {
        // Fall back to anon key
      }

      // Call Supabase Edge Function directly via fetch for transparent error handling
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze_hairline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            photos: photosToSend,
            answers: questionnaire,
          }),
          signal: abortRef.current?.signal,
        }
      );

      clearTimeout(fetchTimeoutId);
      const data = await response.json();

      if (!response.ok || data?.error) {
        const errorMsg = data?.error || `Analysis failed (HTTP ${response.status})`;
        setError(errorMsg);
        setErrorType(response.status === 429 ? 'rate_limit' : 'server_error');
        if (response.status === 429) {
          setRateLimitWait(30);
        }
        inFlightRef.current = false;
        setIsAnalyzing(false);
        return null;
      }

      // Map the full AnalysisResult from edge function response
      const result: AnalysisResult = {
        score: data.score,
        confidence: data.confidence,
        summary: data.summary,
        observations: data.observations || [],
        disclaimer: data.disclaimer || "",
        norwood_scale: data.norwood_scale ?? 2,
        norwood_description: data.norwood_description ?? "",
        detailed_observations: data.detailed_observations || [],
        metrics: data.metrics || [],
        risk_factors: data.risk_factors || [],
        positive_signs: data.positive_signs || [],
        hair_care_routine: data.hair_care_routine || [],
        recommended_actions: data.recommended_actions || [],
        should_see_dermatologist: data.should_see_dermatologist ?? false,
        dermatologist_reason: data.dermatologist_reason ?? "",
        photos_analyzed: data.photos_analyzed ?? photosToSend.length,
        hairline_type: data.hairline_type,
        hairline_description: data.hairline_description,
        personalized_tips: data.personalized_tips,
        follicular_analysis: data.follicular_analysis,
        scalp_condition: data.scalp_condition,
        age_comparison: data.age_comparison,
        prognosis: data.prognosis,
        lifestyle_impact: data.lifestyle_impact,
      };

      // Save cooldown timestamp only on success
      setLastAnalyzeAt(Date.now());

      inFlightRef.current = false;
      setIsAnalyzing(false);
      return result;

    } catch (err) {
      clearTimeout(fetchTimeoutId);
      // Don't set error state for intentional aborts (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        inFlightRef.current = false;
        setIsAnalyzing(false);
        return null;
      }
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      setErrorType('network_error');
      inFlightRef.current = false;
      setIsAnalyzing(false);
      return null;
    }
  }, []);

  const retry = useCallback(async (): Promise<AnalysisResult | null> => {
    if (!lastRequestRef.current) {
      setError('No previous request to retry');
      return null;
    }

    // Clear previous error before retrying
    clearError();

    const { photos, questionnaire } = lastRequestRef.current;
    return analyze(photos, questionnaire);
  }, [analyze, clearError]);

  return {
    isAnalyzing,
    error,
    errorType,
    usedSinglePhoto,
    cooldownRemaining,
    rateLimitWait,
    analyze,
    retry,
    clearError
  };
}
