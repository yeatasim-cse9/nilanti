import type { ParsedCourierResult } from "@/hooks/useBDCourier";
import { normalizeBDPhone } from "./phone";

const CACHE_KEY = "bdcourier_risk_cache_v1";

interface CacheData {
  data: Record<string, ParsedCourierResult>;
  timestamp: number;
}

// Cache expires after 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000;

const loadCacheFromStorage = (): Record<string, ParsedCourierResult> => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    
    const parsed: CacheData = JSON.parse(raw);
    
    // Check if cache is expired
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return {};
    }
    
    return parsed.data || {};
  } catch {
    return {};
  }
};

const saveCacheToStorage = (cache: Record<string, ParsedCourierResult>): void => {
  try {
    const cacheData: CacheData = {
      data: cache,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Storage might be full, ignore
  }
};

export const getFraudCached = (phone: string): ParsedCourierResult | null => {
  const normalized = normalizeBDPhone(phone);
  if (!normalized) return null;
  
  const cache = loadCacheFromStorage();
  return cache[normalized] || null;
};

export const setFraudCached = (phone: string, result: ParsedCourierResult): void => {
  const normalized = normalizeBDPhone(phone);
  if (!normalized) return;
  
  const cache = loadCacheFromStorage();
  cache[normalized] = result;
  saveCacheToStorage(cache);
};

export const clearFraudCache = (): void => {
  sessionStorage.removeItem(CACHE_KEY);
};

export const loadFraudCache = (): Record<string, ParsedCourierResult> => {
  return loadCacheFromStorage();
};
