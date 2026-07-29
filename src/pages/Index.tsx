import { useState, useRef, useEffect, useCallback } from "react";
import { useLocalScans } from "@/hooks/useLocalScans";
import { useScanCredit } from "@/hooks/useScanCredit";

// Screens
import { ScanTabScreen } from "@/components/screens/ScanTabScreen";
import { DailyScreen } from "@/components/screens/DailyScreen";
import { CoachScreen } from "@/components/screens/CoachScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { CaptureScreen, CapturedPhotos } from "@/components/screens/CaptureScreen";
import { ScanningScreen } from "@/components/screens/ScanningScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { PaywallScreen } from "@/components/screens/PaywallScreen";

// Components
import { BottomNav, TabType } from "@/components/BottomNav";
import { QuestionnaireData } from "@/components/Questionnaire";
import { AnalysisResult } from "@/types/analysis";
import { Scan } from "@/types/database";

type AppScreen =
  | "scan"
  | "onboarding"
  | "capture"
  | "scanning"
  | "results"
  | "daily"
  | "coach"
  | "settings"
  | "view-scan"
  | "paywall";

interface AnalysisData {
  photos: CapturedPhotos;
  questionnaire: QuestionnaireData;
}

const ONBOARDING_KEY = "hairmaxx_onboarding_complete";
const SCAN_DONE_KEY = "hairmaxx_scan_completed";

const Index = () => {
  const {
    scans: localScans,
    loaded: scansLoaded,
    saveScanFromAnalysis,
    toggleFavorite,
    deleteScan: deleteLocalScan,
    clearAll: clearAllScans,
  } = useLocalScans();

  const [screen, setScreen] = useState<AppScreen>("scan");
  const [activeTab, setActiveTab] = useState<TabType>("scan");
  const [previousScreen, setPreviousScreen] = useState<AppScreen | null>(null);

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [hasScanned, setHasScanned] = useState(() => {
    try {
      // Check current key first, then migrate from legacy key
      if (localStorage.getItem(SCAN_DONE_KEY) === "true") return true;
      if (localStorage.getItem("hairlinescan_scan_completed") === "true") {
        localStorage.setItem(SCAN_DONE_KEY, "true");
        localStorage.removeItem("hairlinescan_scan_completed");
        return true;
      }
      return false;
    } catch { return false; }
  });

  const { hasCredit, isLoading: purchaseLoading, error: purchaseError, purchase, restore, consumeCredit } = useScanCredit();
  const [pendingPaywall, setPendingPaywall] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      // Check current key first, then migrate from legacy key
      if (localStorage.getItem(ONBOARDING_KEY)) return;
      if (localStorage.getItem("hairlinescan_onboarding_complete")) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        localStorage.removeItem("hairlinescan_onboarding_complete");
        return;
      }
      setShowOnboarding(true);
    } catch {
      // localStorage unavailable (private browsing) — skip onboarding check
    }
  }, []);

  // If view-scan screen has no selected scan, navigate back
  useEffect(() => {
    if (screen === "view-scan" && !selectedScan) {
      setScreen("scan");
      setActiveTab("scan");
    }
  }, [screen, selectedScan]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "scan": setScreen("scan"); break;
      case "daily": setScreen("daily"); break;
      case "coach": setScreen("coach"); break;
      case "settings": setScreen("settings"); break;
    }
  };

  const handleStartScan = () => {
    setPreviousScreen(screen);
    setScreen("capture");
    setActiveTab("scan");
  };

  const handleAnalyze = (photos: CapturedPhotos, questionnaire: QuestionnaireData) => {
    setAnalysisData({ photos, questionnaire });
    if (!hasCredit) {
      setPendingPaywall(true);
    }
    setScreen("scanning");
  };

  const handleScanComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);

    // Consume one scan credit on a successful, completed analysis. Failures
    // bail out before this handler runs, so users only pay for scans they got.
    consumeCredit();

    // Unlock Daily & Coach tabs
    if (!hasScanned) {
      try { localStorage.setItem(SCAN_DONE_KEY, "true"); } catch { /* private browsing */ }
      setHasScanned(true);
    }

    // Always save scan locally
    if (analysisData) {
      saveScanFromAnalysis(
        result,
        analysisData.questionnaire,
        analysisData.photos
      );
    }

    setScreen("results");
  };

  const handleRestart = () => {
    setScreen("scan");
    setActiveTab("scan");
    setAnalysisData(null);
    setAnalysisResult(null);
    setSelectedScan(null);
    setPendingPaywall(false);
  };

  const handleViewCoach = () => {
    setScreen("coach");
    setActiveTab("coach");
    setAnalysisData(null);
    setAnalysisResult(null);
    setSelectedScan(null);
  };

  const handleCancelScanning = () => {
    setAnalysisData(null);
    setAnalysisResult(null);
    setPendingPaywall(false);
    setScreen("capture");
  };

  const handlePaywallNeeded = useCallback(() => {
    setScreen("paywall");
  }, []);

  const handlePaywallUnlock = async () => {
    const success = await purchase();
    if (success) {
      setPendingPaywall(false);
      setScreen("scanning"); // Now runs real analysis
    }
  };

  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handlePaywallRestore = async () => {
    setIsRestoring(true);
    setRestoreMessage(null);
    const success = await restore();
    setIsRestoring(false);
    if (success) {
      setPendingPaywall(false);
      setScreen("scanning");
    } else {
      setRestoreMessage("No restorable purchases found. Per-scan purchases are one-time and cannot be restored. If you previously subscribed and believe this is an error, please contact support.");
    }
  };

  const handlePaywallClose = () => {
    setPendingPaywall(false);
    setAnalysisData(null);
    setAnalysisResult(null);
    setScreen("scan");
    setActiveTab("scan");
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const returnScreen = previousScreen || "scan";
    setScreen(returnScreen);
    // Restore the correct tab based on where we came from
    if (returnScreen === "daily") setActiveTab("daily");
    else if (returnScreen === "coach") setActiveTab("coach");
    else setActiveTab("scan");
    setAnalysisData(null);
    setAnalysisResult(null);
  };

  const handleViewScan = (scan: Scan) => {
    setSelectedScan(scan);
    // Convert Scan to AnalysisResult format (legacy scans may not have new fields)
    const result: AnalysisResult = {
      score: scan.score,
      confidence: scan.confidence,
      summary: scan.summary,
      observations: scan.observations,
      disclaimer: "This cosmetic analysis is for entertainment purposes only.",
      norwood_scale: scan.norwood_scale ?? 2,
      norwood_description: scan.norwood_description ?? "",
      detailed_observations: scan.detailed_observations ?? [],
      metrics: scan.metrics_data ?? [],
      risk_factors: scan.risk_factors ?? [],
      positive_signs: scan.positive_signs ?? [],
      hair_care_routine: scan.hair_care_routine ?? [],
      recommended_actions: scan.recommended_actions ?? [],
      should_see_dermatologist: scan.should_see_dermatologist ?? false,
      dermatologist_reason: scan.dermatologist_reason ?? "",
      photos_analyzed: scan.photos_analyzed ?? 1,
      hairline_type: scan.hairline_type || undefined,
      hairline_description: scan.hairline_description || undefined,
      personalized_tips: scan.personalized_tips,
      follicular_analysis: scan.follicular_analysis || undefined,
      scalp_condition: scan.scalp_condition || undefined,
      age_comparison: scan.age_comparison || undefined,
      prognosis: scan.prognosis || undefined,
      lifestyle_impact: scan.lifestyle_impact || undefined,
    };
    setAnalysisResult(result);
    setScreen("view-scan");
  };

  const handleOnboardingComplete = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* private browsing */ }
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* private browsing */ }
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  const showBottomNav = ["scan", "daily", "coach", "settings"].includes(screen);

  return (
    <main className="h-[100dvh] overflow-hidden">
      {screen === "scan" && (
        <ScanTabScreen
          onStartScan={handleStartScan}
          onViewScan={handleViewScan}
          scans={localScans}
        />
      )}

      {screen === "daily" && (
        <DailyScreen
          onViewScan={handleViewScan}
          onNewScan={handleStartScan}
          scans={localScans}
          onToggleFavorite={toggleFavorite}
          onDeleteScan={deleteLocalScan}
        />
      )}

      {screen === "coach" && (
        <CoachScreen
          onNewScan={handleStartScan}
          scans={localScans}
        />
      )}

      {screen === "capture" && (
        <CaptureScreen
          onAnalyze={handleAnalyze}
          onCancel={handleCancel}
          streamRef={streamRef}
          skipQuestionnaire={localScans.length > 0}
        />
      )}

      {screen === "scanning" && (
        <ScanningScreen
          onComplete={handleScanComplete}
          onCancel={handleCancelScanning}
          photos={analysisData?.photos}
          questionnaire={analysisData?.questionnaire}
          previewOnly={pendingPaywall}
          onPaywallNeeded={handlePaywallNeeded}
        />
      )}

      {screen === "paywall" && (
        <PaywallScreen
          onClose={handlePaywallClose}
          onUnlock={handlePaywallUnlock}
          onRestore={handlePaywallRestore}
          isLoading={purchaseLoading}
          isRestoring={isRestoring}
          error={purchaseError}
          restoreMessage={restoreMessage}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          analysis={analysisResult}
          onRestart={handleRestart}
          onViewCoach={handleViewCoach}
          photo={analysisData?.photos?.front}
        />
      )}

      {screen === "view-scan" && selectedScan && (
        <ResultsScreen
          analysis={analysisResult}
          onRestart={handleRestart}
          onViewCoach={handleViewCoach}
          photo={selectedScan.photo_front_url || undefined}
          savedScan={selectedScan}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen scans={localScans} onClearData={clearAllScans} />
      )}

      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          lockedTabs={[]}
        />
      )}
    </main>
  );
};

export default Index;
