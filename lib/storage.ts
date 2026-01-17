/**
 * Client-side storage utilities
 * Used for passing data between pages and caching
 */

const STORAGE_KEY_PREFIX = "resly_";

export function saveAnalysisResult(result: any) {
  if (typeof window === "undefined") return;
  
  const key = `${STORAGE_KEY_PREFIX}analysis_${Date.now()}`;
  localStorage.setItem(key, JSON.stringify({
    ...result,
    savedAt: new Date().toISOString(),
  }));
  return key;
}

export function getAnalysisResult(key: string) {
  if (typeof window === "undefined") return null;
  
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveCurrentAnalysis(result: any) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${STORAGE_KEY_PREFIX}current_analysis`, JSON.stringify(result));
}

export function getCurrentAnalysis() {
  if (typeof window === "undefined") return null;
  
  const data = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}current_analysis`);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearCurrentAnalysis() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}current_analysis`);
}

