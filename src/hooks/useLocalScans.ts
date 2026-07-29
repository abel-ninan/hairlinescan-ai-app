import { useState, useCallback, useEffect, useRef } from 'react';
import { Scan, ScanMetrics } from '@/types/database';
import { AnalysisResult } from '@/types/analysis';
import { QuestionnaireData } from '@/components/Questionnaire';

export const SCANS_KEY = 'hairmaxx_scans';
const DB_NAME = 'hairmaxx_db';
const DB_VERSION = 1;
const STORE_NAME = 'scans';

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ------- IndexedDB helpers -------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGetAll(): Promise<Scan[]> {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as Scan[]);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbPut(scan: Scan): Promise<void> {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(scan);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

// ------- Migration: localStorage → IndexedDB -------

async function migrateFromLocalStorage(): Promise<Scan[]> {
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    if (!raw) return [];
    const scans = JSON.parse(raw) as Scan[];
    if (!Array.isArray(scans) || scans.length === 0) return [];

    // Write each scan into IndexedDB
    for (const scan of scans) {
      await idbPut(scan);
    }
    // Remove from localStorage after successful migration
    localStorage.removeItem(SCANS_KEY);
    return scans;
  } catch {
    return [];
  }
}

async function loadScansAsync(): Promise<Scan[]> {
  try {
    // Check if there are scans in localStorage that need migrating
    const migrated = await migrateFromLocalStorage();

    const all = await idbGetAll();
    // Sort newest first
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return all.length > 0 ? all : migrated;
  } catch {
    // IndexedDB unavailable — fall back to localStorage
    try {
      const raw = localStorage.getItem(SCANS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Scan[];
    } catch {
      return [];
    }
  }
}

export function useLocalScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Load scans from IndexedDB on mount
  useEffect(() => {
    mountedRef.current = true;
    loadScansAsync().then(data => {
      if (mountedRef.current) {
        setScans(data);
        setLoaded(true);
      }
    }).catch(() => {
      if (mountedRef.current) setLoaded(true);
    });
    return () => { mountedRef.current = false; };
  }, []);

  const saveScanFromAnalysis = useCallback((
    analysisResult: AnalysisResult,
    questionnaire: QuestionnaireData,
    photos?: { front?: string | null; left?: string | null; right?: string | null }
  ): Scan => {
    const aiMetrics = analysisResult.metrics || [];
    const metricsObj: ScanMetrics = {
      symmetry: aiMetrics.find(m => m.label.toLowerCase().includes('symmetry'))?.value ?? analysisResult.score,
      definition: aiMetrics.find(m => m.label.toLowerCase().includes('definition') || m.label.toLowerCase().includes('temple'))?.value ?? analysisResult.score,
      fullness: aiMetrics.find(m => m.label.toLowerCase().includes('density') || m.label.toLowerCase().includes('fullness'))?.value ?? analysisResult.score,
      structure: aiMetrics.find(m => m.label.toLowerCase().includes('coverage') || m.label.toLowerCase().includes('structure'))?.value ?? analysisResult.score,
      texture: aiMetrics.find(m => m.label.toLowerCase().includes('texture') || m.label.toLowerCase().includes('caliber'))?.value ?? analysisResult.score,
    };

    const newScan: Scan = {
      id: generateId(),
      user_id: 'local',
      created_at: new Date().toISOString(),
      score: analysisResult.score,
      confidence: analysisResult.confidence,
      summary: analysisResult.summary,
      hairline_type: analysisResult.hairline_type || null,
      hairline_description: analysisResult.hairline_description || null,
      observations: analysisResult.observations,
      likely_patterns: [],
      personalized_tips: analysisResult.personalized_tips || [],
      photo_front_url: photos?.front || null,
      photo_left_url: photos?.left || null,
      photo_right_url: photos?.right || null,
      questionnaire_data: questionnaire,
      metrics: metricsObj,
      is_favorite: false,
      notes: null,
      norwood_scale: analysisResult.norwood_scale ?? null,
      norwood_description: analysisResult.norwood_description || null,
      detailed_observations: analysisResult.detailed_observations || null,
      metrics_data: analysisResult.metrics || null,
      risk_factors: analysisResult.risk_factors || null,
      positive_signs: analysisResult.positive_signs || null,
      hair_care_routine: analysisResult.hair_care_routine || null,
      recommended_actions: analysisResult.recommended_actions || null,
      should_see_dermatologist: analysisResult.should_see_dermatologist ?? null,
      dermatologist_reason: analysisResult.dermatologist_reason || null,
      photos_analyzed: analysisResult.photos_analyzed ?? null,
      follicular_analysis: analysisResult.follicular_analysis || null,
      scalp_condition: analysisResult.scalp_condition || null,
      age_comparison: analysisResult.age_comparison || null,
      prognosis: analysisResult.prognosis || null,
      lifestyle_impact: analysisResult.lifestyle_impact || null,
    };

    setScans(prev => [newScan, ...prev]);
    // Persist to IndexedDB asynchronously
    idbPut(newScan).catch(() => { /* silent — state is source of truth */ });
    return newScan;
  }, []);

  const toggleFavorite = useCallback((scanId: string) => {
    setScans(prev => {
      const updated = prev.map(s =>
        s.id === scanId ? { ...s, is_favorite: !s.is_favorite } : s
      );
      // Persist the toggled scan
      const toggled = updated.find(s => s.id === scanId);
      if (toggled) idbPut(toggled).catch(() => {});
      return updated;
    });
  }, []);

  const deleteScan = useCallback((scanId: string) => {
    setScans(prev => prev.filter(s => s.id !== scanId));
    idbDelete(scanId).catch(() => {});
  }, []);

  const clearAll = useCallback(async () => {
    setScans([]);
    await idbClear().catch(() => {});
    try { localStorage.removeItem(SCANS_KEY); } catch { /* ignore */ }
  }, []);

  return {
    scans,
    loaded,
    saveScanFromAnalysis,
    toggleFavorite,
    deleteScan,
    clearAll,
    scanCount: scans.length,
  };
}
