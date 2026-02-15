import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/types/analysis";
import { Scan } from "@/types/database";
import {
  RotateCcw,
  Sun,
  Droplets,
  Share2,
  Download,
  AlertTriangle,
  Camera,
  Sparkles,
  User,
  Check,
  Leaf,
  Eye,
  ChevronRight,
  Info,
  ArrowLeft,
  Calendar,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Media } from "@capacitor-community/media";
import { Capacitor } from "@capacitor/core";
import { format } from "date-fns";

interface ResultsScreenProps {
  score: number;
  analysis?: AnalysisResult | null;
  onRestart: () => void;
  photo?: string | null;
  savedScan?: Scan; // For viewing saved scans
}

// Check if the analysis indicates an invalid/unusable image
const isInvalidImage = (analysis: AnalysisResult | null | undefined): boolean => {
  if (!analysis) return false;

  const summary = analysis.summary?.toLowerCase() || '';
  const invalidKeywords = [
    'black', 'dark', 'not visible', 'cannot see', 'unable to', 'no hairline',
    'cannot analyze', 'not possible', 'unclear', 'blurry', 'obscured',
    'covered', 'hidden', 'no image', 'invalid', 'empty'
  ];

  // Check if summary contains invalid image indicators
  const hasInvalidKeyword = invalidKeywords.some(keyword => summary.includes(keyword));

  // Also check if confidence is very low (below 30%)
  const hasLowConfidence = analysis.confidence < 0.3;

  return hasInvalidKeyword || hasLowConfidence;
};

interface MetricRowProps {
  label: string;
  value: number;
  delay?: number;
}

const MetricRow = ({ label, value, delay = 0 }: MetricRowProps) => {
  return (
    <div
      className="opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-semibold text-foreground font-mono w-16">{value}</span>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Grooming tips (cosmetic/appearance focused)
const hairCareTips = [
  { name: "Quality Products", description: "Sulfate-free shampoos can enhance natural shine and texture" },
  { name: "Styling Technique", description: "Blow-drying with cool air can add volume and definition" },
  { name: "Grooming Routine", description: "Regular trims every 4-6 weeks maintain a polished appearance" },
  { name: "Product Application", description: "Apply styling products to damp hair for better distribution" },
  { name: "Finishing Touch", description: "A light hold spray can keep your style in place all day" },
];

export const ResultsScreen = ({ score, analysis, onRestart, photo, savedScan }: ResultsScreenProps) => {
  const [activeTab, setActiveTab] = useState<'rating' | 'tips'>('rating');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Check if image is invalid/unusable
  const imageInvalid = isInvalidImage(analysis);

  // Determine if this is a saved scan view
  const isViewingSavedScan = !!savedScan;

  // Save photo to device - uses native iOS Photo Library on mobile
  const handleSave = useCallback(async () => {
    if (!photo || isSaving) return;

    setIsSaving(true);
    try {
      // Check if running on native iOS/Android
      if (Capacitor.isNativePlatform()) {
        // Validate photo data URL format
        if (!photo.startsWith('data:image/')) {
          throw new Error('Invalid photo format');
        }

        // Save to Photo Library using Media plugin
        // The plugin supports base64 data URLs directly
        // Not specifying albumIdentifier saves to default Camera Roll
        // and triggers add-only permission on iOS 14+
        const result = await Media.savePhoto({
          path: photo,
        });

        if (result && result.filePath) {
          setSaved(true);
          toast.success('Photo saved to Photo Library');
          setTimeout(() => setSaved(false), 2000);
        } else {
          throw new Error('Save returned no file path');
        }
      } else {
        // Fallback for web browser - use download link
        const response = await fetch(photo);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hairlinescan-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSaved(true);
        toast.success('Photo saved successfully');
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error: unknown) {
      // Handle specific error codes from Media plugin
      const mediaError = error as { code?: string; message?: string };
      if (mediaError.code === 'accessDenied') {
        toast.error('Permission denied. Please allow photo library access in Settings.');
      } else if (mediaError.code === 'argumentError') {
        toast.error('Invalid photo format. Please try again.');
      } else {
        toast.error('Failed to save photo. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }, [photo, isSaving]);

  // Share results
  const handleShare = useCallback(async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const shareText = `My HairlineScan Fun Results:\n\nStyle Score: ${Math.round((10 - (analysis?.score ?? score)) * 10)}%\n${analysis?.hairline_type ? `Style: ${analysis.hairline_type}\n` : ''}\nJust for fun - not medical advice!\n\nTry HairlineScan for entertainment`;

      if (navigator.share) {
        await navigator.share({
          title: 'My HairlineScan Results',
          text: shareText,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Results copied to clipboard');
      }
    } catch (err) {
      // User cancelled share - don't show error
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share results');
      }
    } finally {
      setIsSharing(false);
    }
  }, [analysis, score, isSharing]);

  // Generate metrics based on score (only if image is valid)
  const displayScore = analysis?.score ?? score;
  const overallScore = Math.round(Math.max(0, Math.min(100, (10 - displayScore) * 10)));

  // Use useMemo to keep metrics stable across re-renders
  const metrics = useMemo(() => {
    if (imageInvalid) return null;
    return {
      overall: overallScore,
      density: Math.round(Math.max(40, Math.min(98, overallScore + (Math.random() * 20 - 10)))),
      hairline: Math.round(Math.max(40, Math.min(98, overallScore + (Math.random() * 15 - 5)))),
      thickness: Math.round(Math.max(40, Math.min(98, overallScore + (Math.random() * 20 - 10)))),
      scalp: Math.round(Math.max(50, Math.min(98, overallScore + (Math.random() * 10)))),
      potential: Math.round(Math.max(60, Math.min(99, overallScore + 10 + (Math.random() * 10)))),
    };
  }, [imageInvalid, overallScore]);


  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setActiveTab('rating')}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'rating'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Rating
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'tips'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tips
          </button>
        </div>

        {activeTab === 'rating' ? (
          <>
            {/* Profile Photo */}
            {photo && (
              <div className="flex justify-center mb-6">
                <div className={cn(
                  "w-24 h-24 rounded-full overflow-hidden border-2 shadow-lg",
                  imageInvalid ? "border-destructive/30" : "border-primary/30"
                )}>
                  <img
                    src={photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Your Hairline Type Section - only show if valid */}
            {!imageInvalid && analysis?.hairline_type && (
              <div className="glass-panel p-4 mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Your Hairline</span>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {analysis.hairline_type}
                    </span>
                  </div>
                </div>
                {analysis.hairline_description && (
                  <p className="text-sm text-muted-foreground mt-3 pl-12">
                    {analysis.hairline_description}
                  </p>
                )}
              </div>
            )}

            {imageInvalid ? (
              /* Invalid Image State */
              <div className="glass-panel p-8 mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-destructive/10">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Unable to Analyze
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {analysis?.summary || "The image could not be analyzed. Please ensure your hairline is clearly visible in the photo."}
                </p>
                <div className="glass-panel p-4 bg-secondary/50">
                  <h4 className="text-sm font-medium text-foreground mb-2">Tips for better photos:</h4>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5" /> Good lighting on your face</li>
                    <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5" /> Hairline clearly visible</li>
                    <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5" /> No hats or obstructions</li>
                    <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5" /> Face the camera directly</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {/* Disclaimer Banner */}
                <div className="glass-panel p-3 mb-4 bg-blue-500/10 border border-blue-500/30 opacity-0 animate-fade-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                  <div className="flex items-center gap-2 justify-center">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Cosmetic Analysis for Entertainment Only
                    </span>
                  </div>
                </div>

                {/* Metrics Card */}
                {metrics && (
                  <div className="glass-panel p-6 mb-6 space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-lg font-semibold text-foreground">Appearance Analysis</p>
                      <p className="text-xs text-muted-foreground">AI-generated cosmetic assessment</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                      <MetricRow label="Overall Score" value={metrics.overall} delay={0} />
                      <MetricRow label="Symmetry" value={metrics.potential} delay={50} />
                      <MetricRow label="Definition" value={metrics.density} delay={100} />
                      <MetricRow label="Fullness" value={metrics.thickness} delay={150} />
                      <MetricRow label="Structure" value={metrics.hairline} delay={200} />
                      <MetricRow label="Texture" value={metrics.scalp} delay={250} />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground/60 mt-2">For entertainment purposes only - not a professional assessment</p>
                  </div>
                )}

                {/* Summary */}
                {analysis?.summary && (
                  <div className="glass-panel p-4 mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                    <p className="text-foreground text-center text-sm leading-relaxed">{analysis.summary}</p>
                  </div>
                )}

                {/* Patterns */}
                {analysis?.likely_patterns && analysis.likely_patterns.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
                    {analysis.likely_patterns.map((pattern, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground border border-border">
                        {pattern}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto opacity-0 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                  <Button
                    variant="glass"
                    size="lg"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={isSaving || !photo}
                    aria-label="Save photo to device"
                  >
                    {saved ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="glass"
                    size="lg"
                    className="flex-1"
                    onClick={handleShare}
                    disabled={isSharing}
                    aria-label="Share results"
                  >
                    <Share2 className="w-4 h-4" />
                    {isSharing ? 'Sharing...' : 'Share'}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Tips Content - Redesigned */}
            <div className="space-y-5 flex-1 overflow-y-auto pb-4">

              {/* Observations Section - At Top */}
              {analysis?.observations && analysis.observations.length > 0 && (
                <div
                  className="opacity-0 animate-fade-up"
                  style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Observations</h3>
                  </div>
                  <div className="glass-panel p-4 space-y-2">
                    {analysis.observations.map((obs, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-relaxed">{obs}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Tips Section */}
              {analysis?.personalized_tips && analysis.personalized_tips.length > 0 && (
                <div
                  className="opacity-0 animate-fade-up"
                  style={{ animationDelay: '75ms', animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Personalized for You
                    </h3>
                    {analysis.hairline_type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
                        {analysis.hairline_type}
                      </span>
                    )}
                  </div>
                  <div className="glass-panel p-4 border-l-2 border-l-primary space-y-3">
                    {analysis.personalized_tips.map((tip, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-primary font-medium">{j + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hair Care Tips Section */}
              <div
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Hair Care Tips</h3>
                </div>
                <div className="glass-panel overflow-hidden">
                  {hairCareTips.map((tip, i) => (
                    <div
                      key={tip.name}
                      className={cn(
                        "p-4 flex items-center gap-4",
                        i !== hairCareTips.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Sun className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{tip.name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Disclaimer Note */}
              <div
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: '225ms', animationFillMode: 'forwards' }}
              >
                <div className="glass-panel p-4 bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-amber-600 dark:text-amber-400">Medical Disclaimer:</strong> These suggestions are for entertainment only. This app does not provide medical advice. <strong>Consult a qualified doctor or dermatologist</strong> for any health concerns related to hair loss.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* New Scan Button */}
        <div className="mt-6 opacity-0 animate-fade-up" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
          <Button
            variant="scanner"
            size="lg"
            className="w-full"
            onClick={onRestart}
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </Button>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-amber-600 dark:text-amber-400">Medical Disclaimer:</strong> This app is for entertainment purposes only and does not provide medical advice, diagnosis, or treatment. Results are AI-generated and not scientifically validated. <strong>Please consult a qualified doctor or dermatologist</strong> before making any health-related decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
