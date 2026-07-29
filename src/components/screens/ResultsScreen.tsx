import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/types/analysis";
import { Scan } from "@/types/database";
import {
  ArrowLeft,
  RotateCcw,
  Share2,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Info,
  Scissors,
  Shield,
  TrendingUp,
  Clock,
  BookOpen,
  Microscope,
  Activity,
  Users,
  Lightbulb,
  Leaf,
  Heart,
  Moon,
  Dumbbell,
  Utensils,
  Brain,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderBoldText } from "@/lib/renderText";
import { useEdgeSwipeBack } from "@/hooks/useEdgeSwipeBack";
import { toast } from "sonner";
import { NorwoodScale } from "@/components/NorwoodScale";

type TabKey = "score" | "analysis" | "deep" | "routine" | "actions";

interface ResultsScreenProps {
  analysis?: AnalysisResult | null;
  onRestart: () => void;
  onViewCoach?: () => void;
  photo?: string | null;
  savedScan?: Scan;
}

const isInvalidImage = (analysis: AnalysisResult | null | undefined): boolean => {
  if (!analysis) return false;
  const summary = analysis.summary?.toLowerCase() || '';
  // Only flag truly invalid images — use specific phrases to avoid false positives
  // from normal hair descriptions (e.g. "dark hair", "covered well", "hidden thinning")
  const invalidPhrases = [
    'not visible', 'cannot see', 'unable to analyze', 'unable to assess',
    'no hairline detected', 'no hairline visible',
    'cannot analyze', 'not possible to analyze', 'no image',
    'image is black', 'image is dark', 'image is blurry', 'image is empty',
    'photo is black', 'photo is dark', 'photo is blurry',
    'too blurry', 'too dark', 'completely obscured',
  ];
  const hasInvalidPhrase = invalidPhrases.some(phrase => summary.includes(phrase));
  const hasVeryLowConfidence = analysis.confidence < 0.15;
  // Require BOTH a suspicious phrase AND very low confidence to flag as invalid
  // OR just extremely low confidence alone (< 0.1)
  return (hasInvalidPhrase && hasVeryLowConfidence) || analysis.confidence < 0.1;
};

const severityColor: Record<string, string> = {
  none: "bg-green-500/15 text-green-400 border-green-500/20",
  mild: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  moderate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  significant: "bg-red-500/15 text-red-400 border-red-500/20",
};

const priorityColor: Record<string, string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-blue-500/15 text-blue-400",
};

export const ResultsScreen = ({ analysis, onRestart, onViewCoach, photo, savedScan }: ResultsScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("score");
  const [isSharing, setIsSharing] = useState(false);
  const [expandedRoutineStep, setExpandedRoutineStep] = useState<number | null>(null);

  useEdgeSwipeBack(onRestart);

  const imageInvalid = isInvalidImage(analysis);
  const score = analysis?.score ?? 0;
  const overallPercent = Math.round(Math.max(0, Math.min(100, score * 10)));

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const shareText = `My HairMaxx Results:\n\nOverall Score: ${overallPercent}%\n${analysis?.hairline_type ? `Style: ${analysis.hairline_type}\n` : ''}\nJust for fun - not medical advice!`;
      if (navigator.share) {
        await navigator.share({ title: 'My HairMaxx Results', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Results copied to clipboard');
      }
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.name !== 'AbortError') toast.error('Failed to share results');
    } finally {
      setIsSharing(false);
    }
  }, [analysis, overallPercent, isSharing]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "score", label: "Score" },
    { key: "analysis", label: "Analysis" },
    { key: "deep", label: "Deep Dive" },
    { key: "routine", label: "Routine" },
    { key: "actions", label: "Plan" },
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="safe-area-top flex-shrink-0" />

        {/* Back button header */}
        <div className="px-5 pt-3 pb-1 flex-shrink-0">
          <button
            onClick={onRestart}
            className="flex items-center gap-1 text-primary text-sm font-medium min-h-[44px] py-2 px-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Segmented tab bar */}
        <div className="px-5 pt-1 pb-2 flex-shrink-0">
          <div className="flex gap-1 p-1 bg-secondary/80 rounded-xl" role="tablist" aria-label="Results sections">
            {tabs.map(tab => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 tracking-wide min-h-[44px] flex items-center justify-center",
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>

          {imageInvalid ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-destructive/10 mb-4">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Unable to Analyze</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-xs">
                {analysis?.summary || "Please ensure your hairline is clearly visible."}
              </p>
              <div className="rounded-2xl bg-card border border-border/50 p-4 w-full">
                <h4 className="text-sm font-medium text-foreground mb-2">Tips for better photos</h4>
                <ul className="text-sm text-muted-foreground text-left space-y-1.5">
                  <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" /> Good lighting on your face</li>
                  <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" /> Hairline clearly visible</li>
                  <li className="flex gap-2"><Camera className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" /> No hats or obstructions</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* ========== SCORE TAB ========== */}
              {activeTab === "score" && (
                <div className="space-y-5 pt-3 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                  {/* Hero score */}
                  <div className="text-center py-6">
                    {photo && (
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto">
                      {/* Background ring */}
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(220 20% 15%)" strokeWidth="5" />
                        <circle
                          cx="64" cy="64" r="56" fill="none"
                          stroke="hsl(217 91% 60%)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${(overallPercent / 100) * 351.9} 351.9`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="animate-fade-up text-center">
                        <span className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
                          {overallPercent}
                        </span>
                        <span className="text-lg text-muted-foreground font-normal">%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 font-medium">Overall Hairline Score</p>
                    {analysis?.hairline_type && (
                      <span className="inline-block mt-3 px-3.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/15">
                        {analysis.hairline_type}
                      </span>
                    )}
                  </div>

                  {/* Score context card */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-semibold text-primary">What Your Score Means</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {overallPercent >= 80
                        ? 'Excellent hairline appearance. Your hair shows strong density, good symmetry, and healthy follicular patterns. Continue your current hair care routine to maintain these results.'
                        : overallPercent >= 60
                        ? 'Good hairline appearance with some areas for attention. Minor changes may be present but are within normal variation. Consistent hair care habits and monitoring can help maintain your current state.'
                        : overallPercent >= 40
                        ? 'Moderate changes detected in your hairline appearance. Consistent grooming habits and the right products can make a big difference. Check the Coach tab for styling tips and product suggestions.'
                        : 'Noticeable changes observed in your hairline. A good grooming routine and styling approach can help you look your best. If you have concerns, consider chatting with a barber or stylist for personalized advice.'}
                    </p>
                  </div>

                  {/* Norwood Scale */}
                  {analysis && analysis.norwood_scale && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <NorwoodScale
                        level={analysis.norwood_scale}
                        description={analysis.norwood_description}
                      />
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                          {analysis.norwood_scale <= 2
                            ? 'This scale classifies hairline appearance into 7 stages. Stages 1-2 represent minimal change — a mature hairline with slight temple recession is normal and common for most men by their late 20s.'
                            : analysis.norwood_scale <= 4
                            ? 'Stages 3-4 show deeper temple recession and possible top-of-head thinning. Many men find that adjusting their grooming routine and hairstyle at this stage makes a noticeable difference. Check the Coach tab for personalized tips.'
                            : 'Stages 5-7 represent more advanced changes where front and top areas may blend together. Exploring different hairstyles and grooming products can help you look your best. A barber or stylist can offer great personalized advice.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  {analysis?.summary && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <p className="text-sm text-foreground leading-relaxed">{renderBoldText(analysis.summary)}</p>
                    </div>
                  )}

                  {/* Metrics grid from AI */}
                  {analysis?.metrics && analysis.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {analysis.metrics.map((metric, i) => {
                        const pct = Math.round(Math.max(0, Math.min(100, metric.value * 10)));
                        return (
                          <div key={i} className="rounded-2xl bg-card border border-border/50 p-3.5 animate-fade-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] text-muted-foreground font-medium">{metric.label}</span>
                              <span className="text-sm font-bold text-foreground tabular-nums">
                                {pct}<span className="text-[10px] text-muted-foreground font-normal">%</span>
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 70 ? 'hsl(152 69% 45%)' : pct >= 40 ? 'hsl(217 91% 60%)' : 'hsl(38 92% 50%)',
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 mt-1.5 leading-relaxed line-clamp-2">
                              {renderBoldText(metric.description)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hairline Type & Description */}
                  {analysis?.hairline_description && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Hairline Classification</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{renderBoldText(analysis.hairline_description)}</p>
                    </div>
                  )}

                  {/* Age Comparison */}
                  {analysis?.age_comparison && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Compared to Your Age Group</h3>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.age_comparison)}</p>
                    </div>
                  )}

                  {/* Personalized Tips */}
                  {analysis?.personalized_tips && analysis.personalized_tips.length > 0 && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Personalized Tips</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {analysis.personalized_tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(tip)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Share button */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    <Share2 className="w-4 h-4" />
                    {isSharing ? 'Sharing...' : 'Share Results'}
                  </Button>
                </div>
              )}

              {/* ========== ANALYSIS TAB ========== */}
              {activeTab === "analysis" && (
                <div className="space-y-5 pt-3 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                  {/* Analysis explainer */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-semibold text-primary">Understanding This Analysis</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Each area of your hairline is assessed independently. Levels indicate the degree of visible change: <span className="text-green-400 font-medium">none</span> means no notable changes, <span className="text-blue-400 font-medium">mild</span> means subtle changes within normal variation, <span className="text-amber-400 font-medium">moderate</span> means noticeable changes worth keeping an eye on, and <span className="text-red-400 font-medium">significant</span> means more noticeable changes. Remember — this is for entertainment only.
                    </p>
                  </div>

                  {/* Detailed observations */}
                  {analysis?.detailed_observations && analysis.detailed_observations.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Detailed Observations</h3>
                      <div className="space-y-2">
                        {analysis.detailed_observations.map((obs, i) => (
                          <div key={i} className="rounded-2xl bg-card border border-border/50 p-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-foreground capitalize">{obs.area}</span>
                              <span className={cn(
                                "text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                severityColor[obs.severity] || severityColor.none
                              )}>
                                {obs.severity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{renderBoldText(obs.observation)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Positive signs */}
                  {analysis?.positive_signs && analysis.positive_signs.length > 0 && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-semibold text-foreground">Positive Signs</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.positive_signs.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(sign)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk factors */}
                  {analysis?.risk_factors && analysis.risk_factors.length > 0 && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-foreground">Things to Watch</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.risk_factors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(factor)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Did you know card */}
                  <div className="rounded-2xl bg-card border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Did You Know?</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Hair changes gradually over time, and you might not notice small differences day to day. That's why regular scanning is a fun way to track your look — comparing photos over weeks and months can reveal subtle style changes that are easy to miss in the mirror.
                    </p>
                  </div>

                  {/* Photos analyzed */}
                  {analysis?.photos_analyzed && (
                    <p className="text-[11px] text-muted-foreground/70 text-center">
                      Based on {analysis.photos_analyzed} photo{analysis.photos_analyzed > 1 ? 's' : ''} analyzed
                    </p>
                  )}
                </div>
              )}

              {/* ========== DEEP DIVE TAB ========== */}
              {activeTab === "deep" && (
                <div className="space-y-5 pt-3 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                  {/* Deep dive explainer */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-semibold text-primary">About This Deep Dive</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      This section provides an in-depth look at your hair appearance based on visual assessment. Density refers to how full your hair looks in each area. Hair thickness measures the proportion of thin, fine hairs vs. thick, healthy hairs. These are AI-generated entertainment estimates, not professional measurements.
                    </p>
                  </div>

                  {/* Follicular Analysis */}
                  {analysis?.follicular_analysis && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Microscope className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Appearance Analysis</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{renderBoldText(analysis.follicular_analysis.description)}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-t border-border/40">
                          <div>
                            <span className="text-[11px] text-muted-foreground font-medium block">Fullness</span>
                            <span className="text-[10px] text-muted-foreground/60">How full your hair looks</span>
                          </div>
                          <span className="text-[11px] text-foreground font-semibold max-w-[55%] text-right">{analysis.follicular_analysis.density_estimate}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-border/40">
                          <div>
                            <span className="text-[11px] text-muted-foreground font-medium block">Hair Thickness</span>
                            <span className="text-[10px] text-muted-foreground/60">Fine vs. thick hair balance</span>
                          </div>
                          <span className="text-[11px] text-foreground font-semibold max-w-[55%] text-right">{analysis.follicular_analysis.miniaturization_ratio}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-border/40">
                          <div>
                            <span className="text-[11px] text-muted-foreground font-medium block">Thick:Fine Ratio</span>
                            <span className="text-[10px] text-muted-foreground/60">Thick vs. fine hair proportion</span>
                          </div>
                          <span className="text-[11px] text-foreground font-semibold max-w-[55%] text-right">{analysis.follicular_analysis.terminal_to_vellus}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scalp Condition */}
                  {analysis?.scalp_condition && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Scalp Appearance</h3>
                        <span className={cn(
                          "text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ml-auto",
                          analysis.scalp_condition.health === 'excellent' ? "bg-green-500/15 text-green-400" :
                          analysis.scalp_condition.health === 'good' ? "bg-blue-500/15 text-blue-400" :
                          analysis.scalp_condition.health === 'fair' ? "bg-amber-500/15 text-amber-400" :
                          "bg-red-500/15 text-red-400"
                        )}>
                          {analysis.scalp_condition.health}
                        </span>
                      </div>
                      {analysis.scalp_condition.issues.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Issues Observed</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.scalp_condition.issues.map((issue, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.scalp_condition.recommendations.length > 0 && (
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Scalp Recommendations</p>
                          <ul className="space-y-1.5">
                            {analysis.scalp_condition.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(rec)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prognosis */}
                  {analysis?.prognosis && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Outlook</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">3-6 Month Outlook</p>
                          <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.prognosis.short_term)}</p>
                        </div>
                        <div className="border-t border-border/40 pt-3">
                          <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">1-3 Year Outlook</p>
                          <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.prognosis.long_term)}</p>
                        </div>
                        <div className="border-t border-border/40 pt-3">
                          <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">Maintenance Potential</p>
                          <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.prognosis.preventability)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lifestyle Impact */}
                  {analysis?.lifestyle_impact && (
                    <div className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Lifestyle Impact</h3>
                        <span className={cn(
                          "text-sm font-bold ml-auto px-2.5 py-0.5 rounded-lg",
                          analysis.lifestyle_impact.overall_grade === 'A' ? "bg-green-500/15 text-green-400" :
                          analysis.lifestyle_impact.overall_grade === 'B' ? "bg-blue-500/15 text-blue-400" :
                          analysis.lifestyle_impact.overall_grade === 'C' ? "bg-amber-500/15 text-amber-400" :
                          "bg-red-500/15 text-red-400"
                        )}>
                          {analysis.lifestyle_impact.overall_grade}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <Utensils className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Diet</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.lifestyle_impact.diet_impact)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Brain className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Stress</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.lifestyle_impact.stress_impact)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Moon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Sleep</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.lifestyle_impact.sleep_impact)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Dumbbell className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Exercise</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{renderBoldText(analysis.lifestyle_impact.exercise_impact)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Science behind the analysis */}
                  <div className="rounded-2xl bg-card border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">The Science</h3>
                    </div>
                    <div className="space-y-2.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Hair goes through natural growth cycles: a growth phase (2-7 years), a transition phase (2-3 weeks), and a resting phase (~3 months). At any given time, most of your hair is actively growing.
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Hair changes over time are influenced by genetics, hormones, and aging. Thick hairs can gradually become finer over successive growth cycles, which is a natural process that varies from person to person.
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Lifestyle factors — diet, stress, sleep quality, and exercise — all play a role in how your hair looks and feels. Good habits can help you maintain healthy-looking hair.
                      </p>
                    </div>
                  </div>

                  {/* Observations count */}
                  <p className="text-[11px] text-muted-foreground/70 text-center">
                    {analysis?.detailed_observations?.length ?? 0} areas analyzed across {analysis?.photos_analyzed ?? 0} photo{(analysis?.photos_analyzed ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* ========== ROUTINE TAB ========== */}
              {activeTab === "routine" && (
                <div className="space-y-3 pt-3 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Your Hair Care Routine</h3>
                    <p className="text-xs text-muted-foreground">AI-personalized steps based on your analysis</p>
                  </div>

                  {/* Routine context */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-semibold text-primary">Consistency Is Key</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Hair grows approximately 1.25 cm (0.5 inches) per month
                      {" "}
                      <a
                        href="https://www.aad.org/public/diseases/hair-loss/insider/shedding"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                        aria-label="Source: American Academy of Dermatology — Do you have hair loss or hair shedding?"
                      >
                        [source: AAD]
                      </a>
                      . Consistent grooming habits take time to show results — give any new routine 3-6 months before judging effectiveness. The best approach combines good hair care products, scalp hygiene, and healthy lifestyle habits. Tap any step below for details and suggestions.
                    </p>
                  </div>

                  {analysis?.hair_care_routine && analysis.hair_care_routine.length > 0 ? (
                    analysis.hair_care_routine.map((step, i) => {
                      const isExpanded = expandedRoutineStep === i;
                      return (
                        <button
                          key={i}
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedRoutineStep(isExpanded ? null : i)}
                          className="w-full text-left rounded-2xl bg-card border border-border/50 p-4 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">{step.step_number}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{step.title}</p>
                              <p className="text-[11px] text-muted-foreground">{step.frequency}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          {isExpanded && (
                            <div className="mt-3 pl-11 space-y-2">
                              <p className="text-xs text-muted-foreground leading-relaxed">{renderBoldText(step.description)}</p>
                              {step.products && step.products.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {step.products.map((product, j) => (
                                    <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                      {renderBoldText(product)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No routine data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* ========== ACTIONS TAB ========== */}
              {activeTab === "actions" && (
                <div className="space-y-5 pt-3 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Action Plan</h3>
                    <p className="text-xs text-muted-foreground">Prioritized recommendations</p>
                  </div>

                  {analysis?.recommended_actions && analysis.recommended_actions.length > 0 ? (
                    <div className="space-y-3">
                      {[...analysis.recommended_actions]
                        .sort((a, b) => {
                          const order = { high: 0, medium: 1, low: 2 };
                          return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
                        })
                        .map((action, i) => (
                          <div key={i} className="rounded-2xl bg-card border border-border/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                priorityColor[action.priority] || priorityColor.medium
                              )}>
                                {action.priority}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                                <Clock className="w-3 h-3" />
                                {action.timeframe}
                              </div>
                            </div>
                            <h4 className="text-sm font-medium text-foreground mb-1">{renderBoldText(action.action)}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{renderBoldText(action.description)}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No action items available</p>
                    </div>
                  )}

                  {/* When to see a professional */}
                  {analysis?.should_see_dermatologist && (
                    <div className="rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Scissors className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-1">Consider a Hair Care Professional</h4>
                          <p className="text-xs text-foreground/70 leading-relaxed">
                            {analysis.dermatologist_reason || 'For personalized advice, a barber, stylist, or hair care specialist can give you tailored recommendations for your look.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General wellness note */}
                  <div className="rounded-2xl bg-card border border-border/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Professional Guidance</h4>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          For personalized advice about your hair, consider consulting a barber or stylist. They can give you tailored recommendations based on your hair type, face shape, and personal style goals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grooming essentials */}
                  <div className="rounded-2xl bg-card border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Grooming Essentials</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                      Key habits that help you look your best every day:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Quality Shampoo', 'Conditioner', 'Scalp Care', 'Good Nutrition', 'Hydration', 'Sun Protection', 'Regular Trims'].map((item) => (
                        <span key={item} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border/30">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom area: Coach + New Scan + Disclaimer — inside scroll */}
          <div className="pt-5 pb-2 space-y-3">
            {onViewCoach && (
              <Button
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-semibold"
                onClick={onViewCoach}
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                View Hair Care Guide
              </Button>
            )}
            <Button
              size="lg"
              variant={onViewCoach ? "outline" : "default"}
              className="w-full h-14 rounded-2xl text-base font-semibold"
              onClick={onRestart}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              New Scan
            </Button>

            <div className="flex items-start gap-2 px-1">
              <Info className="w-3 h-3 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                For entertainment only. Not medical advice. Consult a doctor for health concerns.
              </p>
            </div>
          </div>
          <div className="safe-area-bottom flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};
