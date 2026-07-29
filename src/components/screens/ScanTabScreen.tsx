import { Scan } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import {
  ScanLine,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanTabScreenProps {
  onStartScan: () => void;
  onViewScan: (scan: Scan) => void;
  scans: Scan[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-blue-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'bg-green-500/15 border-green-500/20';
  if (score >= 6) return 'bg-blue-500/15 border-blue-500/20';
  if (score >= 4) return 'bg-amber-500/15 border-amber-500/20';
  return 'bg-red-500/15 border-red-500/20';
}

function getScoreRingColor(score: number): string {
  if (score >= 8) return 'ring-green-500/30';
  if (score >= 6) return 'ring-blue-500/30';
  if (score >= 4) return 'ring-amber-500/30';
  return 'ring-red-500/30';
}

export const ScanTabScreen = ({
  onStartScan,
  onViewScan,
  scans,
}: ScanTabScreenProps) => {
  const recentScans = [...scans]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const latestScan = recentScans[0];
  const latestScore = latestScan ? Math.round(latestScan.score * 10) : null;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="safe-area-top flex-shrink-0" />

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HairMaxx</h1>
            <p className="text-sm text-muted-foreground">Scan & analyze your hair</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-2">
        <div className="space-y-4">

          {/* Hero image card — only before first scan */}
          {scans.length === 0 && (
            <div className="rounded-[24px] overflow-hidden" style={{ background: '#1a1a1e' }}>
              <img
                src="/hero-scan.png"
                alt="Get your ratings and recommendations"
                className="w-full block"
              />
              <div className="px-5 pt-4 pb-5">
                <Button
                  size="lg"
                  onClick={onStartScan}
                  className="w-full h-14 rounded-2xl text-base font-semibold"
                >
                  Begin Scan
                </Button>
              </div>
            </div>
          )}

          {/* New Scan button — after first scan */}
          {scans.length > 0 && (
            <Button
              size="lg"
              onClick={onStartScan}
              className="w-full h-14 rounded-2xl text-base font-semibold"
            >
              New Scan
            </Button>
          )}

          {/* Latest Score Card */}
          {latestScan && latestScore !== null && (
            <button
              onClick={() => onViewScan(latestScan)}
              className="w-full rounded-2xl bg-card border border-border/50 p-5 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                {/* Score circle */}
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-background ring-2 ${getScoreRingColor(latestScan.score)}`}>
                  <div className="text-center">
                    <span className={`text-xl font-bold tabular-nums ${getScoreColor(latestScan.score)}`}>
                      {latestScore}%
                    </span>
                  </div>
                  {/* Score ring SVG */}
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(220 20% 18%)" strokeWidth="3" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke="hsl(217 91% 60%)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(latestScore / 100) * 175.9} 175.9`}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Latest Score</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {latestScan.hairline_type || 'Hair Analysis'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </div>
            </button>
          )}

          {/* Recent scans */}
          {recentScans.length > 0 && (
            <div>
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent Scans</h3>
              <div className="space-y-2">
                {recentScans.map((scan, i) => (
                  <button
                    key={scan.id}
                    onClick={() => onViewScan(scan)}
                    className="w-full text-left rounded-2xl bg-card border border-border/50 p-3.5 flex items-center gap-3.5 transition-all active:scale-[0.98] animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-border/50">
                      {scan.photo_front_url ? (
                        <img src={scan.photo_front_url} alt="Scan" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <ScanLine className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold tabular-nums ${getScoreColor(scan.score)}`}>
                          {Math.round(scan.score * 10)}%
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${getScoreBg(scan.score)}`}>
                          {scan.score >= 8 ? 'Excellent' : scan.score >= 6 ? 'Good' : scan.score >= 4 ? 'Fair' : 'Low'}
                        </span>
                        {scan.is_favorite && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick insight */}
          {recentScans.length >= 2 && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary mb-0.5">Track Your Progress</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Regular scans help you spot changes early. Check the History tab to see your score trend over time.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-24 flex-shrink-0" />
      </div>
    </div>
  );
};
