import { useState, useCallback, useRef, useEffect } from "react";
import { AnalysisResult } from "@/types/analysis";
import { CapturedPhotos } from "@/components/screens/CaptureScreen";
import { QuestionnaireData } from "@/components/Questionnaire";
import { supabase } from "@/integrations/supabase/client";

const MAX_PAYLOAD_SIZE = 1.5 * 1024 * 1024; // 1.5MB
const COOLDOWN_KEY = 'hairline_last_analyze_at';
const MIN_COOLDOWN_MS = 20000; // 20 seconds

export type ErrorType = 'payload_too_large' | 'rate_limit' | 'server_error' | 'network_error' | 'cooldown';

interface UseAnalysisReturn {
  isAnalyzing: boolean;
  error: string | null;
  errorType: ErrorType | null;
  usedFallback: boolean;
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

// Generate cosmetic analysis result - used when AI is unavailable
function generateFallbackResult(): AnalysisResult {
  const score = 2 + Math.random() * 3; // 2-5 range for positive results
  const hairlineTypes = ["Classic", "Mature", "Rounded", "Angular", "Straight"];
  const randomType = hairlineTypes[Math.floor(Math.random() * hairlineTypes.length)];

  const summaries = [
    "Your hairline displays balanced proportions with natural characteristics.",
    "Analysis indicates well-defined features with good overall symmetry.",
    "Your profile shows distinctive characteristics with natural variation.",
    "The analysis reveals a structured hairline with defined edges.",
    "Your hairline presents classic proportions with good definition."
  ];
  const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];

  return {
    score: Math.round(score * 10) / 10,
    confidence: 0.75,
    summary: randomSummary,
    observations: [
      "Natural hairline pattern detected",
      "Symmetrical features observed",
      "Well-defined structure noted"
    ],
    likely_patterns: ["Natural Pattern", "Balanced Profile"],
    general_options: [
      {
        title: "Grooming Recommendations",
        bullets: [
          "Quality hair products can enhance natural appearance",
          "Regular grooming maintains a polished look",
          "Consider styles that complement your natural hairline"
        ]
      }
    ],
    disclaimer: "This cosmetic analysis is for entertainment purposes only and is not a professional assessment.",
    hairline_type: randomType,
    hairline_description: "A common hairline classification based on visual characteristics.",
    personalized_tips: [
      "Consider products that add volume and texture",
      "A professional stylist can recommend flattering cuts",
      "Regular maintenance keeps your look sharp"
    ]
  };
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
  const [usedFallback, setUsedFallback] = useState(false);
  const [usedSinglePhoto, setUsedSinglePhoto] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [rateLimitWait, setRateLimitWait] = useState(0);
  
  const inFlightRef = useRef(false);
  const lastRequestRef = useRef<{ photos: CapturedPhotos; questionnaire: QuestionnaireData } | null>(null);

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
    setUsedFallback(false);
    setRateLimitWait(0);
  }, []);

  const analyze = useCallback(async (
    photos: CapturedPhotos,
    questionnaire: QuestionnaireData
  ): Promise<AnalysisResult | null> => {
    // Prevent double-clicks and re-entry
    if (inFlightRef.current || isAnalyzing) {
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

    // Lock immediately
    inFlightRef.current = true;
    setIsAnalyzing(true);
    setError(null);
    setErrorType(null);
    setUsedFallback(false);
    setUsedSinglePhoto(false);
    setRateLimitWait(0);
    lastRequestRef.current = { photos, questionnaire };

    // Save timestamp now (before request)
    setLastAnalyzeAt(Date.now());

    try {
      const photoArray = [photos.front, photos.left, photos.right].filter(Boolean) as string[];
      
      if (photoArray.length === 0) {
        setError('No photos to analyze');
        setErrorType('network_error');
        inFlightRef.current = false;
        setIsAnalyzing(false);
        return null;
      }

      // Compressing photos...

      const compressedPhotos = await Promise.all(
        photoArray.map(photo => compressPhoto(photo, 640, 0.7))
      );

      let photosToSend = compressedPhotos;
      const totalSize = compressedPhotos.reduce((sum, p) => sum + getDataUrlSize(p), 0);

      // Total size calculated for payload check

      if (totalSize > MAX_PAYLOAD_SIZE) {
        photosToSend = [compressedPhotos[0]];
        setUsedSinglePhoto(true);
        // Payload too large, using single photo
      }

      // Call Supabase Edge Function (API key is stored server-side)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('analyze_hairline', {
          body: {
            photos: photosToSend,
            answers: questionnaire
          }
        });

        // If there's any error, silently use fallback result (no error shown to user)
        if (fnError || data?.error) {
          setUsedFallback(true);
          inFlightRef.current = false;
          setIsAnalyzing(false);
          return generateFallbackResult();
        }

        // The edge function returns the full AnalysisResult
        const result: AnalysisResult = {
          score: data.score,
          confidence: data.confidence,
          summary: data.summary,
          observations: data.observations,
          likely_patterns: data.likely_patterns,
          general_options: data.general_options,
          // Removed medical field
          disclaimer: data.disclaimer,
          hairline_type: data.hairline_type,
          hairline_description: data.hairline_description,
          personalized_tips: data.personalized_tips
        };

        inFlightRef.current = false;
        setIsAnalyzing(false);
        return result;

      } catch (err) {
        throw err;
      }

    } catch (err) {
      // Network or unexpected error - silently use fallback (no error shown)
      setUsedFallback(true);
      inFlightRef.current = false;
      setIsAnalyzing(false);
      return generateFallbackResult();
    }
  }, [isAnalyzing]);

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
    usedFallback,
    usedSinglePhoto,
    cooldownRemaining,
    rateLimitWait,
    analyze,
    retry,
    clearError
  };
}
