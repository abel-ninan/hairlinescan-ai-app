import { useRef, useState, useEffect, useCallback, MutableRefObject } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScannerOverlay } from "@/components/ScannerOverlay";
import { PhotoCapture } from "@/components/PhotoCapture";
import { Questionnaire, QuestionnaireData } from "@/components/Questionnaire";
import { ArrowLeft, ArrowRight, Camera, RotateCcw, Check, SwitchCamera, Sparkles, Sun, Hand, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CapturedPhotos {
  front: string | null;
  left: string | null;
  right: string | null;
}

interface CaptureScreenProps {
  onAnalyze: (photos: CapturedPhotos, questionnaire: QuestionnaireData) => void;
  onCancel: () => void;
  streamRef: MutableRefObject<MediaStream | null>;
  skipQuestionnaire?: boolean;
}

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;
type PhotoStep = "front" | "left" | "right";

const STEP_COUNT = 6;

const initialQuestionnaire: QuestionnaireData = {
  ageRange: "",
  recentChanges: "",
  familyHistory: "",
  sheddingLevel: "",
  scalpIssues: "",
};

// Wizard progress dots
const WizardProgress = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-1 rounded-full transition-all duration-300",
          i === current
            ? "w-6 bg-primary"
            : i < current
            ? "w-1.5 bg-primary/50"
            : "w-1.5 bg-white/15"
        )}
      />
    ))}
  </div>
);

export const CaptureScreen = ({ onAnalyze, onCancel, streamRef, skipQuestionnaire }: CaptureScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const prevFacingModeRef = useRef<"user" | "environment">("user");
  const [step, setStep] = useState<WizardStep>(0);
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<CapturedPhotos>({ front: null, left: null, right: null });
  const [tempCapture, setTempCapture] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(initialQuestionnaire);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");

  const photoStepMap: Record<1 | 2 | 3, PhotoStep> = { 1: "front", 2: "left", 3: "right" };
  const currentPhotoStep: PhotoStep | null = step >= 1 && step <= 3 ? photoStepMap[step as 1 | 2 | 3] : null;

  const hasAtLeastOnePhoto = photos.front !== null || photos.left !== null || photos.right !== null;
  const canAnalyze = consent && hasAtLeastOnePhoto;

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = mediaStream;
      setCameraError(null);
      setHasCamera(true);

      // Directly attach to video if already in DOM (e.g. facingMode switch).
      // For initial start, Effect 3 handles attachment after React renders the video element.
      requestAnimationFrame(() => {
        if (videoRef.current && mediaStream.active) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (error: unknown) {
      const errName = error instanceof Error ? error.name : '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera access in your device Settings.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError('Camera is in use by another app.');
      } else {
        setCameraError('Unable to access camera. Please check your settings.');
      }
      setHasCamera(false);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, streamRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  }, [streamRef]);

  const reattachTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reattachStream = useCallback(async () => {
    if (reattachTimeoutRef.current) clearTimeout(reattachTimeoutRef.current);
    reattachTimeoutRef.current = setTimeout(async () => {
      reattachTimeoutRef.current = null;
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try { await videoRef.current.play(); } catch { /* noop */ }
      }
    }, 50);
  }, [streamRef]);

  // Start camera when entering photo steps
  useEffect(() => {
    if (step >= 1 && step <= 3 && !hasCamera && !cameraError) {
      startCamera();
    }
  }, [step, hasCamera, cameraError, startCamera]);

  // Restart camera ONLY when facingMode actually changes (not when other deps change)
  useEffect(() => {
    if (facingMode !== prevFacingModeRef.current) {
      prevFacingModeRef.current = facingMode;
      if (step >= 1 && step <= 3) {
        startCamera();
      }
    }
  }, [facingMode, step, startCamera]);

  // Attach stream to video element after it renders.
  // The video element only exists in DOM when hasCamera is true,
  // so we need this separate effect to wire up srcObject after render.
  useEffect(() => {
    if (hasCamera && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [hasCamera, step, streamRef]);

  // Cleanup camera and timers on unmount
  useEffect(() => {
    return () => {
      if (reattachTimeoutRef.current) clearTimeout(reattachTimeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const goNext = useCallback(() => {
    setSlideDirection("right");
    setTempCapture(null);
    setStep(prev => {
      const next = Math.min(prev + 1, STEP_COUNT - 1) as WizardStep;
      // Skip questionnaire step (4) if user has already scanned before
      if (next === 4 && skipQuestionnaire) return 5 as WizardStep;
      return next;
    });
  }, [skipQuestionnaire]);

  const goBack = useCallback(() => {
    setSlideDirection("left");
    setTempCapture(null);
    if (step === 0) {
      stopCamera();
      onCancel();
    } else {
      setStep(prev => {
        const back = Math.max(prev - 1, 0) as WizardStep;
        // Skip questionnaire step (4) going back too
        if (back === 4 && skipQuestionnaire) return 3 as WizardStep;
        return back;
      });
    }
  }, [step, stopCamera, onCancel, skipQuestionnaire]);

  // Swipe gesture handling (only on photo steps 0-3, not on scrollable questionnaire/review)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Disable swipe on questionnaire (step 4) and review (step 5) — they have scrollable content
    if (step >= 4) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      // Block swipe during photo preview
      if (tempCapture) return;

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Must be primarily horizontal: >50px horizontal, <75px vertical
      if (Math.abs(dx) > 50 && Math.abs(dy) < 75) {
        if (dx < 0) {
          // Swipe left → next
          goNext();
        } else {
          // Swipe right → back
          goBack();
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goBack, tempCapture, step]);

  const handleCapture = (dataUrl: string) => {
    setTempCapture(dataUrl);
  };

  const handleRetake = () => {
    setTempCapture(null);
    reattachStream();
  };

  const handleUsePhoto = () => {
    if (tempCapture && currentPhotoStep) {
      setPhotos(prev => ({ ...prev, [currentPhotoStep]: tempCapture }));
      setTempCapture(null);
      // Auto-advance to next step
      goNext();
    }
  };

  const handleSkipPhoto = () => {
    goNext();
  };

  const handleAnalyze = () => {
    if (isSubmitting || !canAnalyze) return;
    setIsSubmitting(true);
    stopCamera();
    onAnalyze(photos, questionnaire);
  };

  const stepTitles: Record<number, string> = {
    0: "Get Ready",
    1: "Front View",
    2: "Left Side",
    3: "Right Side",
    4: "Quick Questions",
    5: "Review",
  };

  const slideClass = slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <div className="safe-area-top flex-shrink-0" />
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-primary text-sm font-medium min-h-[44px] min-w-[44px] py-2 px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? "Cancel" : "Back"}
        </button>
        <WizardProgress current={step} total={STEP_COUNT} />
        <span className="text-xs text-muted-foreground w-12 text-right">
          {step + 1}/{STEP_COUNT}
        </span>
      </div>

      {/* Step content */}
      <div ref={containerRef} className={cn("flex-1 flex flex-col overflow-hidden", step >= 1 && step <= 3 ? "" : "px-5")}>

        {/* ========== STEP 0: Instructions ========== */}
        {step === 0 && (
          <div key={step} className={cn("flex-1 flex flex-col", slideClass)}>
            {/* Top content — vertically centered */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  Let's Scan Your Hairline
                </h1>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                  We'll take 3 photos from different angles for the most accurate analysis.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: Camera, title: "3 angles needed", desc: "Front, left side, right side" },
                  { icon: Sun, title: "Good lighting", desc: "Face a window or bright light" },
                  { icon: Hand, title: "Pull hair back", desc: "Expose your full hairline" },
                  { icon: Eye, title: "Eye level", desc: "Hold camera at eye level" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3.5 p-3 rounded-xl bg-card border border-border/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{title}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA — prominent, pinned at bottom */}
            <div className="pt-4 pb-4">
              <button
                onClick={goNext}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform "
              >
                Start Capture
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="safe-area-bottom flex-shrink-0" />
          </div>
        )}

        {/* ========== STEPS 1-3: Photo Capture ========== */}
        {step >= 1 && step <= 3 && (
          <div key={step} className={cn("flex-1 flex flex-col overflow-hidden", slideClass)}>
            {/* Step label */}
            <div className="text-center py-3">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {stepTitles[step]}
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "Face the camera directly, hairline visible"}
                {step === 2 && "Turn your head to show the left side"}
                {step === 3 && "Turn your head to show the right side"}
              </p>
            </div>

            {/* Camera viewfinder - fills available space */}
            <div className="flex-1 relative mx-2 mb-3 rounded-3xl overflow-hidden bg-black/90">
              {hasCamera && !tempCapture ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                  />
                  <ScannerOverlay
                    angleGuide={currentPhotoStep || undefined}
                  />
                </>
              ) : tempCapture ? (
                <img
                  src={tempCapture}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  {cameraError ? (
                    <>
                      <p className="text-destructive text-sm mb-4 text-center">{cameraError}</p>
                      <Button
                        variant="outline"
                        onClick={() => { setCameraError(null); startCamera(); }}
                        disabled={isLoading}
                        className="rounded-xl"
                      >
                        {isLoading ? "Starting..." : "Try Again"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm mb-4">Camera access needed</p>
                      <Button
                        onClick={startCamera}
                        disabled={isLoading}
                        className="rounded-xl"
                      >
                        {isLoading ? "Starting..." : "Enable Camera"}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Switch camera button - top right */}
              {hasCamera && !tempCapture && (
                <button
                  onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                  className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Capture controls - bottom area */}
            <div className="pb-2 pt-2">
              {tempCapture ? (
                <div className="flex items-center justify-center gap-8 px-6">
                  <button
                    onClick={handleRetake}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Retake</span>
                  </button>
                  <button
                    onClick={handleUsePhoto}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xs text-primary font-medium">Use Photo</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={handleSkipPhoto}
                    className="text-xs text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    Skip
                  </button>
                  <PhotoCapture
                    videoRef={videoRef}
                    facingMode={facingMode}
                    onCapture={handleCapture}
                    hasCamera={hasCamera}
                  />
                  <div className="w-12" /> {/* Spacer for centering */}
                </div>
              )}
            </div>
            <div className="safe-area-bottom flex-shrink-0" />
          </div>
        )}

        {/* ========== STEP 4: Questionnaire ========== */}
        {step === 4 && (
          <div key={step} className={cn("flex-1 flex flex-col overflow-hidden", slideClass)}>
            <div className="flex-1 overflow-y-auto py-4">
              <Questionnaire data={questionnaire} onChange={setQuestionnaire} />
            </div>
            <div className="pb-3 pt-3 px-4">
              <Button
                onClick={goNext}
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="safe-area-bottom flex-shrink-0" />
          </div>
        )}

        {/* ========== STEP 5: Review ========== */}
        {step === 5 && (
          <div key={step} className={cn("flex-1 flex flex-col overflow-hidden", slideClass)}>
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">Review & Analyze</h2>
                <p className="text-sm text-muted-foreground">Confirm your photos before analysis</p>
              </div>

              {/* Photo thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {(["front", "left", "right"] as const).map((key) => (
                  <div key={key} className="flex flex-col items-center gap-1.5">
                    <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-secondary/50 border border-border/50">
                      {photos[key] ? (
                        <img src={photos[key]!} alt={key} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {key === "front" ? "Front" : key === "left" ? "Left" : "Right"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Questionnaire summary */}
              {(questionnaire.ageRange || questionnaire.familyHistory) && (
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">Your Info</h3>
                  <div className="flex flex-wrap gap-2">
                    {questionnaire.ageRange && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                        Age: {questionnaire.ageRange}
                      </span>
                    )}
                    {questionnaire.familyHistory && questionnaire.familyHistory !== "none" && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                        Family: {questionnaire.familyHistory}
                      </span>
                    )}
                    {questionnaire.sheddingLevel && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                        Shedding: {questionnaire.sheddingLevel}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Consent */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I understand this is for <strong className="text-foreground">entertainment only</strong>, not medical advice. My photos will be sent to an AI service for analysis and results are saved on my device. I will consult a doctor for any health concerns.
                </Label>
              </div>
            </div>

            {/* Analyze button */}
            <div className="pb-3 pt-3 px-4">
              <Button
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-semibold"
                onClick={handleAnalyze}
                disabled={!canAnalyze || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-1" />
                    Analyze My Hairline
                  </>
                )}
              </Button>
            </div>
            <div className="safe-area-bottom flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};
