import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Scan, ScanMetrics, QuestionnaireData } from '@/types/database';
import { AnalysisResult } from '@/types/analysis';

interface SaveScanParams {
  score: number;
  confidence: number;
  summary: string;
  hairlineType?: string;
  hairlineDescription?: string;
  observations: string[];
  likelyPatterns: string[];
  personalizedTips: string[];
  photoFrontUrl?: string;
  photoLeftUrl?: string;
  photoRightUrl?: string;
  questionnaire: QuestionnaireData;
  metrics?: ScanMetrics;
}

export const useScanHistory = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveScan = useCallback(async (params: SaveScanParams): Promise<Scan | null> => {
    if (!user) {
      console.log('No user logged in, scan not saved');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate metrics from score if not provided
      const metrics = params.metrics || generateMetrics(params.score);

      const scanData = {
        user_id: user.id,
        score: params.score,
        confidence: params.confidence,
        summary: params.summary,
        hairline_type: params.hairlineType || null,
        hairline_description: params.hairlineDescription || null,
        observations: params.observations,
        likely_patterns: params.likelyPatterns,
        personalized_tips: params.personalizedTips,
        photo_front_url: params.photoFrontUrl || null,
        photo_left_url: params.photoLeftUrl || null,
        photo_right_url: params.photoRightUrl || null,
        questionnaire_data: params.questionnaire,
        metrics: metrics,
        is_favorite: false,
        notes: null
      };

      const { data, error: insertError } = await supabase
        .from('scans')
        .insert(scanData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Refresh profile to update scan count
      await refreshProfile();

      return data as Scan;
    } catch (err: any) {
      console.error('Error saving scan:', err);
      setError(err.message || 'Failed to save scan');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile]);

  const saveScanFromAnalysis = useCallback(async (
    analysisResult: AnalysisResult,
    questionnaire: QuestionnaireData,
    photoUrl?: string
  ): Promise<Scan | null> => {
    return saveScan({
      score: analysisResult.score,
      confidence: analysisResult.confidence,
      summary: analysisResult.summary,
      hairlineType: analysisResult.hairline_type,
      hairlineDescription: analysisResult.hairline_description,
      observations: analysisResult.observations,
      likelyPatterns: analysisResult.likely_patterns,
      personalizedTips: analysisResult.personalized_tips || [],
      photoFrontUrl: photoUrl,
      questionnaire: questionnaire
    });
  }, [saveScan]);

  const getScans = useCallback(async (limit?: number): Promise<Scan[]> => {
    if (!user) return [];

    try {
      let query = supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as Scan[]) || [];
    } catch (err) {
      console.error('Error fetching scans:', err);
      return [];
    }
  }, [user]);

  const getScan = useCallback(async (scanId: string): Promise<Scan | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Scan;
    } catch (err) {
      console.error('Error fetching scan:', err);
      return null;
    }
  }, [user]);

  const updateScan = useCallback(async (
    scanId: string,
    updates: Partial<Pick<Scan, 'is_favorite' | 'notes'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('scans')
        .update(updates)
        .eq('id', scanId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating scan:', err);
      return false;
    }
  }, [user]);

  const deleteScan = useCallback(async (scanId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      return true;
    } catch (err) {
      console.error('Error deleting scan:', err);
      return false;
    }
  }, [user, refreshProfile]);

  return {
    saveScan,
    saveScanFromAnalysis,
    getScans,
    getScan,
    updateScan,
    deleteScan,
    loading,
    error
  };
};

// Generate realistic-looking metrics based on overall score
function generateMetrics(score: number): ScanMetrics {
  const baseVariance = 1.5;

  const generateMetric = (base: number): number => {
    const variance = (Math.random() - 0.5) * baseVariance * 2;
    const value = base + variance;
    return Math.min(10, Math.max(0, Number(value.toFixed(1))));
  };

  return {
    symmetry: generateMetric(score * 0.95 + 0.5),
    definition: generateMetric(score * 0.9 + 0.8),
    fullness: generateMetric(score * 0.85 + 1),
    structure: generateMetric(score * 0.92 + 0.6),
    texture: generateMetric(score * 0.88 + 0.9)
  };
}
