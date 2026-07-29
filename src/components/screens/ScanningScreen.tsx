import { useState, useEffect, useRef } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Scan, Cpu, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CapturedPhotos } from "@/components/screens/CaptureScreen";
import { QuestionnaireData } from "@/components/Questionnaire";
import { AnalysisResult } from "@/types/analysis";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Button } from "@/components/ui/button";

interface ScanningScreenProps {
  onComplete: (result: AnalysisResult) => void;
  onCancel: () => void;
  photos?: CapturedPhotos;
  questionnaire?: QuestionnaireData;
  previewOnly?: boolean;
  onPaywallNeeded?: () => void;
}

const SCAN_STEPS = [
  { label: "Processing images...", icon: Scan, detail: "Preparing your photos" },
  { label: "Analyzing hairline pattern...", icon: Sparkles, detail: "AI pattern recognition" },
  { label: "Assessing appearance...", icon: Cpu, detail: "Detailed assessment" },
  { label: "Building your care tips...", icon: BarChart3, detail: "Generating suggestions" },
];

export const ScanningScreen = ({ onComplete, onCancel, photos, questionnaire, previewOnly, onPaywallNeeded }: ScanningScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayPhotoIndex, setDisplayPhotoIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const hasStartedRef = useRef(false);
  const mountedRef = useRef(true);
  const analysisCompleteRef = useRef(false);
  const analysisResultRef = useRef<AnalysisResult | null>(null);
  const analysisFailedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Keep refs in sync with state
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { analysisCompleteRef.current = analysisComplete; }, [analysisComplete]);
  useEffect(() => { analysisResultRef.current = analysisResult; }, [analysisResult]);
  useEffect(() => { analysisFailedRef.current = analysisFailed; }, [analysisFailed]);

  const {
    error,
    errorType,
    usedSinglePhoto,
    analyze,
    clearError
  } = useAnalysis();

  const capturedPhotos = photos
    ? [photos.front, photos.left, photos.right].filter(Boolean) as string[]
    : [];

  const availableLabels = photos
    ? [photos.front ? "Front" : null, photos.left ? "Left" : null, photos.right ? "Right" : null].filter(Boolean)
    : [];

  // Scanning line animation — CSS-driven via scan-sweep keyframe
  // No JS interval needed; position is driven by CSS animation

  // Cycle through photos during scanning
  useEffect(() => {
    if (capturedPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setDisplayPhotoIndex(prev => (prev + 1) % capturedPhotos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [capturedPhotos.length]);

  // Preview mode — show scanning briefly then trigger paywall
  useEffect(() => {
    if (!previewOnly || !onPaywallNeeded) return;
    const timer = setTimeout(() => {
      if (mountedRef.current) onPaywallNeeded();
    }, 5000);
    return () => clearTimeout(timer);
  }, [previewOnly, onPaywallNeeded]);

  // Start analysis (runs once initially, and again on retry) — skip in preview mode
  useEffect(() => {
    if (previewOnly) return;
    if (hasStartedRef.current || !photos || capturedPhotos.length === 0) return;
    hasStartedRef.current = true;

    const runAnalysis = async () => {
      try {
        const result = await analyze(photos, questionnaire || {
          ageRange: '',
          recentChanges: '',
          familyHistory: '',
          sheddingLevel: '',
          scalpIssues: ''
        });

        if (!mountedRef.current) return;
        if (result) {
          setAnalysisResult(result);
          setAnalysisComplete(true);
        } else {
          setAnalysisFailed(true);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Analysis error:', err);
        if (mountedRef.current) setAnalysisFailed(true);
      }
    };

    runAnalysis();
  }, [previewOnly, photos, capturedPhotos.length, questionnaire, analyze, retryTrigger]);

  // Progress animation - 12 seconds total (uses refs to avoid restarting interval)
  // retryTrigger in deps ensures the timer restarts on retry
  useEffect(() => {
    const totalDuration = 12000;
    const tick = 50;
    const increment = 100 / (totalDuration / tick);
    let timeAtNinetyFive = 0;
    const MAX_WAIT_AT_95 = 120000; // 2 minutes — Gemini 2.5 Flash (thinking model) can take 30-90s

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;

        if (next >= 100 && analysisCompleteRef.current && analysisResultRef.current) {
          clearInterval(progressTimer);
          const result = analysisResultRef.current;
          setTimeout(() => {
            if (mountedRef.current) {
              onCompleteRef.current(result);
            }
          }, 300);
          return 100;
        }

        // If analysis failed and we hit 95%, show error
        if (next >= 95 && analysisFailedRef.current) {
          clearInterval(progressTimer);
          return 95;
        }

        if (next >= 95 && !analysisCompleteRef.current) {
          timeAtNinetyFive += tick;
          if (timeAtNinetyFive >= MAX_WAIT_AT_95) {
            clearInterval(progressTimer);
            setAnalysisFailed(true);
            return 95;
          }
          return 95;
        }

        return Math.min(next, 100);
      });
    }, tick);

    return () => clearInterval(progressTimer);
  }, [retryTrigger]);

  // Step progression - retryTrigger in deps ensures restart on retry
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        clearInterval(stepTimer);
        return prev;
      });
    }, 3000);
    return () => clearInterval(stepTimer);
  }, [retryTrigger]);

  const showError = (analysisFailed || (error && errorType !== 'cooldown')) && !analysisComplete;
  const showCooldownError = error && errorType === 'cooldown' && !analysisComplete;
  const CurrentStepIcon = SCAN_STEPS[currentStep]?.icon || Scan;

  const handleRetry = () => {
    hasStartedRef.current = false;
    setAnalysisFailed(false);
    setAnalysisComplete(false);
    setAnalysisResult(null);
    setProgress(0);
    setCurrentStep(0);
    clearError();
    setRetryTrigger(prev => prev + 1);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <div className="safe-area-top flex-shrink-0" />
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
            <CurrentStepIcon className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">AI Analysis</h2>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {analysisComplete ? 'Analysis complete' : SCAN_STEPS[currentStep]?.detail || "Processing..."}
            </p>
          </div>
        </div>
      </div>

      {/* Photo display with scanning effect */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {capturedPhotos.length > 0 && (
          <div className="relative w-full max-w-sm">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black/90 shadow-2xl">
              <img
                src={capturedPhotos[displayPhotoIndex]}
                alt={`Analyzing ${availableLabels[displayPhotoIndex] || 'photo'}`}
                className="w-full h-full object-cover"
              />

              {/* Grid overlay using theme primary */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Scanning line using CSS animation */}
              <div
                className="absolute left-0 right-0 h-0.5 pointer-events-none animate-scan-sweep"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.7), hsl(var(--primary)), hsl(var(--primary) / 0.7), transparent)`,
                  boxShadow: `0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)`
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/60" />
              <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/60" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/60" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/60" />

              {/* Data readout */}
              <div className="absolute top-4 right-4">
                <div className="text-[11px] font-mono text-primary/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  ANALYZING
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="text-[11px] font-mono text-primary/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  {availableLabels[displayPhotoIndex]?.toUpperCase() || "SCAN"} {displayPhotoIndex + 1}/{capturedPhotos.length}
                </div>
              </div>
            </div>

            {/* Photo dots */}
            {capturedPhotos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {capturedPhotos.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === displayPhotoIndex
                        ? "bg-primary w-6"
                        : "bg-white/15 w-1.5"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step label */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <CurrentStepIcon className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {analysisComplete ? 'Analysis complete' : SCAN_STEPS[currentStep]?.label || 'Processing...'}
            </span>
          </div>
          {usedSinglePhoto && (
            <p className="text-xs text-muted-foreground mt-2">Using primary photo for optimized analysis</p>
          )}
        </div>
      </div>

      {/* Error states */}
      {(showError || showCooldownError) && (
        <div className="px-6 pb-4">
          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex flex-col items-center text-center gap-3">
              <h3 className="font-semibold text-foreground">
                {showCooldownError ? "Please Wait" : "Analysis Failed"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || "Something went wrong. Please try again."}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="rounded-xl">
                  Go Back
                </Button>
                {showError && (
                  <Button onClick={handleRetry} className="rounded-xl">
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-6 pt-2 pb-6">
        <div className="max-w-sm mx-auto">
          <ProgressBar progress={progress} className="mb-4" />
          <div className="flex justify-between">
            {SCAN_STEPS.map((step, index) => {
              const isComplete = index < currentStep;
              const isActive = index === currentStep;
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isComplete ? "bg-primary border-primary text-primary-foreground" :
                    isActive ? "bg-primary/12 border-primary text-primary" :
                    "bg-secondary/60 border-transparent text-muted-foreground/50"
                  )}>
                    {isComplete ? (
                      <span className="text-xs font-bold">&#10003;</span>
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="safe-area-bottom flex-shrink-0" />
    </div>
  );
};
