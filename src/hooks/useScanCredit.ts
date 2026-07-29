import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

const CREDIT_KEY = 'hairmaxx_scan_credits';
const LEGACY_SUB_KEY = 'hairmaxx_subscribed';

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY ?? '';
const SCAN_PRODUCT_ID = 'com.hairlinescan.app.scan';

function readCredits(): number {
  try {
    const raw = localStorage.getItem(CREDIT_KEY);
    if (raw === null) {
      // Grandfather legacy subscribers into a small starter credit pool so the
      // app keeps working for anyone who paid under the old subscription.
      if (localStorage.getItem(LEGACY_SUB_KEY) === 'true') {
        localStorage.setItem(CREDIT_KEY, '999');
        return 999;
      }
      return 0;
    }
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeCredits(n: number) {
  try {
    localStorage.setItem(CREDIT_KEY, String(Math.max(0, n | 0)));
  } catch { /* private browsing */ }
}

export function useScanCredit() {
  const [credits, setCredits] = useState<number>(() => readCredits());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) return;
      if (!REVENUECAT_API_KEY) {
        console.error('RevenueCat API key missing. Set VITE_REVENUECAT_API_KEY in .env');
        return;
      }
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } catch (e) {
        console.warn('RevenueCat init failed:', e);
      }
    };
    init();
  }, []);

  const purchase = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (!Capacitor.isNativePlatform()) {
      setError('Purchases are only available in the app.');
      return false;
    }

    setIsLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');

      const offerings = await Purchases.getOfferings();
      const current = offerings.current;

      let pkg = current?.availablePackages?.find(
        (p: any) => p?.product?.identifier === SCAN_PRODUCT_ID
      ) ?? current?.availablePackages?.[0];

      if (!pkg) {
        setError('No scan packages available right now. Please try again.');
        setIsLoading(false);
        return false;
      }

      await Purchases.purchaseStoreProduct({ product: pkg.product });

      const next = readCredits() + 1;
      writeCredits(next);
      setCredits(next);

      setIsLoading(false);
      return true;
    } catch (e: any) {
      if (e?.userCancelled || e?.code === '1' || e?.code === 1) {
        setIsLoading(false);
        return false;
      }

      const errMsg = typeof e?.message === 'string'
        ? e.message.slice(0, 200)
        : 'Purchase failed. Please try again.';
      setError(errMsg);
      setIsLoading(false);
      return false;
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;

    setIsLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // Consumables are not restorable by Apple's rules — restorePurchases is
      // still called for compliance (Apple Review Guideline 3.1.1 requires it)
      // and to recover any legacy "HairMaxx Pro" subscribers.
      const { customerInfo } = await Purchases.restorePurchases();

      const hadLegacySub = !!customerInfo.entitlements.active['HairMaxx Pro'];
      if (hadLegacySub) {
        // Legacy subscriber — grant generous credit pool
        const next = 999;
        writeCredits(next);
        setCredits(next);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      // No legacy entitlement and consumables don't restore — return false so
      // the UI can show "No restorable purchases" message.
      return false;
    } catch (e) {
      console.error('Restore failed:', e);
      setError('Unable to restore purchases. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const consumeCredit = useCallback(() => {
    setCredits(prev => {
      const next = Math.max(0, prev - 1);
      writeCredits(next);
      return next;
    });
  }, []);

  const hasCredit = credits > 0;

  return { credits, hasCredit, isLoading, error, purchase, restore, consumeCredit };
}
