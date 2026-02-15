import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useScanHistory } from "@/hooks/useScanHistory";

// Screens
import { HomeScreen } from "@/components/screens/HomeScreen";
import { LandingScreen } from "@/components/screens/LandingScreen";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { CaptureScreen, CapturedPhotos } from "@/components/screens/CaptureScreen";
import { ScanningScreen } from "@/components/screens/ScanningScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";

// Components
import { BottomNav, TabType } from "@/components/BottomNav";
import { QuestionnaireData } from "@/components/Questionnaire";
import { AnalysisResult } from "@/types/analysis";
import { Scan } from "@/types/database";

type AppScreen =
  | "home"
  | "landing"
  | "auth"
  | "onboarding"
  | "capture"
  | "scanning"
  | "results"
  | "history"
  | "settings"
  | "view-scan";

interface AnalysisData {
  photos: CapturedPhotos;
  questionnaire: QuestionnaireData;
}

const ONBOARDING_KEY = "hairlinescan_onboarding_complete";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { saveScanFromAnalysis } = useScanHistory();

  // Screen state
  const [screen, setScreen] = useState<AppScreen>("home");
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [previousScreen, setPreviousScreen] = useState<AppScreen | null>(null);

  // Analysis state
  const [riskScore, setRiskScore] = useState<number>(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  // Camera stream ref
  const streamRef = useRef<MediaStream | null>(null);

  // Check onboarding status
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding && !authLoading) {
      setShowOnboarding(true);
    }
  }, [authLoading]);

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setScreen("home");
        break;
      case "scan":
        setScreen("capture");
        break;
      case "history":
        setScreen("history");
        break;
      case "settings":
        setScreen("settings");
        break;
    }
  };

  // Navigation handlers
  const handleStartScan = () => {
    setPreviousScreen(screen);
    setScreen("capture");
    setActiveTab("scan");
  };

  const handleAnalyze = (photos: CapturedPhotos, questionnaire: QuestionnaireData) => {
    setAnalysisData({ photos, questionnaire });
    setScreen("scanning");
  };

  const handleScanComplete = async (score: number, result?: AnalysisResult) => {
    setRiskScore(score);
    setAnalysisResult(result || null);

    // Save scan to history if user is logged in
    if (result && analysisData) {
      await saveScanFromAnalysis(
        result,
        analysisData.questionnaire as any,
        analysisData.photos.front
      );
    }

    setScreen("results");
  };

  const handleRestart = () => {
    setScreen("home");
    setActiveTab("home");
    setRiskScore(0);
    setAnalysisData(null);
    setAnalysisResult(null);
    setSelectedScan(null);
  };

  const handleCancelScanning = () => {
    setScreen("capture");
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScreen(previousScreen || "home");
    setActiveTab("home");
    setAnalysisData(null);
    setAnalysisResult(null);
  };

  const handleViewScan = (scan: Scan) => {
    setSelectedScan(scan);
    // Convert Scan to AnalysisResult format
    const result: AnalysisResult = {
      score: scan.score,
      confidence: scan.confidence,
      summary: scan.summary,
      observations: scan.observations,
      likely_patterns: scan.likely_patterns,
      general_options: [
        {
          title: "Grooming Tips",
          bullets: scan.personalized_tips.slice(0, 3)
        }
      ],
      disclaimer: "This cosmetic analysis is for entertainment purposes only.",
      hairline_type: scan.hairline_type || undefined,
      hairline_description: scan.hairline_description || undefined,
      personalized_tips: scan.personalized_tips
    };
    setAnalysisResult(result);
    setRiskScore(scan.score);
    setScreen("view-scan");
  };

  const handleSignIn = () => {
    setPreviousScreen(screen);
    setScreen("auth");
  };

  const handleAuthSuccess = () => {
    setScreen(previousScreen || "home");
    setActiveTab("home");
  };

  const handleAuthBack = () => {
    setScreen(previousScreen || "home");
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Determine if we should show the bottom nav
  const showBottomNav = ["home", "history", "settings"].includes(screen);

  return (
    <main className="min-h-screen">
      {/* Home Screen */}
      {screen === "home" && (
        <HomeScreen
          onStartScan={handleStartScan}
          onViewHistory={() => handleTabChange("history")}
          onViewScan={handleViewScan}
          onSignIn={handleSignIn}
        />
      )}

      {/* Auth Screen */}
      {screen === "auth" && (
        <AuthScreen onBack={handleAuthBack} onSuccess={handleAuthSuccess} />
      )}

      {/* Capture Screen */}
      {screen === "capture" && (
        <CaptureScreen
          onAnalyze={handleAnalyze}
          onCancel={handleCancel}
          streamRef={streamRef}
        />
      )}

      {/* Scanning Screen */}
      {screen === "scanning" && (
        <ScanningScreen
          onComplete={handleScanComplete}
          onCancel={handleCancelScanning}
          photos={analysisData?.photos}
          questionnaire={analysisData?.questionnaire}
        />
      )}

      {/* Results Screen */}
      {screen === "results" && (
        <ResultsScreen
          score={riskScore}
          analysis={analysisResult}
          onRestart={handleRestart}
          photo={analysisData?.photos?.front}
        />
      )}

      {/* View Saved Scan Screen */}
      {screen === "view-scan" && selectedScan && (
        <ResultsScreen
          score={selectedScan.score}
          analysis={analysisResult}
          onRestart={handleRestart}
          photo={selectedScan.photo_front_url || undefined}
          savedScan={selectedScan}
        />
      )}

      {/* History Screen */}
      {screen === "history" && (
        <HistoryScreen
          onViewScan={handleViewScan}
          onNewScan={handleStartScan}
        />
      )}

      {/* Settings Screen */}
      {screen === "settings" && (
        <SettingsScreen onNavigateToAuth={handleSignIn} />
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isAuthenticated={!!user}
        />
      )}
    </main>
  );
};

export default Index;
