import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Trash2,
  ChevronRight,
  BarChart3,
  Award,
  ScanLine,
  Lightbulb,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scan } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';

interface DailyScreenProps {
  onViewScan: (scan: Scan) => void;
  onNewScan: () => void;
  scans: Scan[];
  onToggleFavorite: (scanId: string) => void;
  onDeleteScan: (scanId: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-blue-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-red-400';
}

export const DailyScreen = ({ onViewScan, onNewScan, scans, onToggleFavorite, onDeleteScan }: DailyScreenProps) => {
  const { toast } = useToast();

  // Sort scans by date (newest first)
  const sortedScans = [...scans].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate streak from local data — allows starting from yesterday if no scan today
  const calculateStreak = (): number => {
    if (sortedScans.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scanDates = sortedScans.map(s => {
      const d = new Date(s.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
    const uniqueDates = [...new Set(scanDates)].sort((a, b) => b - a);

    // Determine starting point: if most recent scan is today or yesterday, start counting
    const mostRecent = uniqueDates[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();

    let startOffset = 0;
    if (mostRecent === todayTime) {
      startOffset = 0;
    } else if (mostRecent === yesterdayTime) {
      startOffset = 1;
    } else {
      return 0; // Last scan was more than a day ago
    }

    let currentStreak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i - startOffset);
      expectedDate.setHours(0, 0, 0, 0);
      if (uniqueDates[i] === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streak = calculateStreak();

  const handleToggleFavorite = (scan: Scan) => {
    onToggleFavorite(scan.id);
    toast({ title: scan.is_favorite ? 'Removed from favorites' : 'Added to favorites' });
  };

  const handleDeleteScan = (scanId: string) => {
    onDeleteScan(scanId);
    toast({ title: 'Scan deleted' });
  };

  function calculateTrend(scans: Scan[]): 'up' | 'down' | 'stable' {
    if (scans.length < 2) return 'stable';
    const recent = scans.slice(0, Math.min(5, scans.length));
    const older = scans.slice(Math.min(5, scans.length));
    if (older.length === 0) return 'stable';
    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;
    if (recentAvg > olderAvg + 0.5) return 'up';
    if (recentAvg < olderAvg - 0.5) return 'down';
    return 'stable';
  }

  function getStreakMessage(streak: number): string {
    if (streak === 0) return 'Start scanning to build your streak';
    if (streak === 1) return 'Great start! Come back tomorrow';
    if (streak < 7) return "You're building momentum!";
    return 'Incredible consistency!';
  }

  const stats = {
    totalScans: sortedScans.length,
    averageScore: sortedScans.length > 0
      ? (sortedScans.reduce((sum, s) => sum + s.score, 0) / sortedScans.length).toFixed(1)
      : '0',
    trend: calculateTrend(sortedScans),
  };

  const chartData = sortedScans
    .slice()
    .reverse()
    .slice(-30)
    .map(scan => ({
      date: format(new Date(scan.created_at), 'MMM d'),
      score: scan.score,
      fullDate: format(new Date(scan.created_at), 'MMM d, yyyy'),
    }));

  const dailyTips = [
    "Maintain a consistent hair care routine for best results",
    "Stay hydrated — it affects your hair health too",
    "Consider a gentle scalp massage during shampooing",
    "Protect your hairline from sun exposure",
    "Regular trims help maintain a polished appearance",
  ];
  const todaysTip = dailyTips[new Date().getDay() % dailyTips.length];

  // No scans yet — show CTA
  if (sortedScans.length === 0) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="safe-area-top flex-shrink-0" />
        <div className="px-5 pt-6 pb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">Your scan history & progress</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 space-y-4">
          {/* Hero image card */}
          <div className="rounded-[24px] overflow-hidden" style={{ background: '#1a1a1e' }}>
            <img
              src="/hero-history.png"
              alt="View past scans and track your progress"
              className="w-full block"
            />
            <div className="px-5 pt-4 pb-5">
              <Button
                size="lg"
                onClick={onNewScan}
                className="w-full h-14 rounded-2xl text-base font-semibold"
              >
                Begin Scan
              </Button>
            </div>
          </div>

          <div className="h-24 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Has scans
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="safe-area-top flex-shrink-0" />
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">Your scan history & progress</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-5">
        {/* Streak card */}
        <div className="rounded-2xl bg-card border border-border/50 p-5 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-3">
            <Flame className="w-7 h-7 text-orange-400" />
          </div>
          <p className="text-5xl font-bold tabular-nums text-foreground tracking-tight">{streak}</p>
          <p className="text-sm font-semibold text-primary mt-1">Day Streak</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{getStreakMessage(streak)}</p>
        </div>

        {/* Your Progress — horizontal scroll strip */}
        <div>
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Your Progress</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {/* New scan card */}
            <button
              onClick={onNewScan}
              aria-label="Start new scan"
              className="w-[68px] h-[68px] rounded-xl bg-primary/8 border-2 border-dashed border-primary/25 flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6 text-primary/60" />
            </button>
            {sortedScans.slice(0, 10).map((scan) => (
              <button
                key={scan.id}
                onClick={() => onViewScan(scan)}
                className="w-[68px] h-[68px] rounded-xl bg-secondary overflow-hidden flex-shrink-0 active:scale-95 transition-all border border-border/50 relative group"
              >
                {scan.photo_front_url ? (
                  <img src={scan.photo_front_url} alt="Scan" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ScanLine className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
                {/* Score overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-0.5 pt-3">
                  <span className={`text-[11px] font-bold tabular-nums ${getScoreColor(scan.score)}`}>
                    {Math.round(scan.score * 10)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-card border border-border/50 p-3.5 text-center">
            <BarChart3 className="w-4 h-4 mx-auto mb-1.5 text-blue-400" />
            <p className="text-2xl font-bold tabular-nums tracking-tight">{stats.totalScans}</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Scans</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3.5 text-center">
            {stats.trend === 'up' && <TrendingUp className="w-4 h-4 mx-auto mb-1.5 text-green-400" />}
            {stats.trend === 'down' && <TrendingDown className="w-4 h-4 mx-auto mb-1.5 text-red-400" />}
            {stats.trend === 'stable' && <Minus className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground/50" />}
            <p className="text-2xl font-bold capitalize tracking-tight">{stats.trend}</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Trend</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3.5 text-center">
            <Award className="w-4 h-4 mx-auto mb-1.5 text-amber-400" />
            <p className="text-2xl font-bold tabular-nums tracking-tight">{stats.averageScore}</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Average</p>
          </div>
        </div>

        {/* Score trend chart */}
        {chartData.length >= 2 && (
          <div className="rounded-2xl bg-card border border-border/50 p-4">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Score Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dailyScoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(215, 20%, 45%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="hsl(215, 20%, 45%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 25%, 14%)',
                      border: '1px solid hsl(220, 20%, 28%)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                    labelStyle={{ color: 'hsl(210, 40%, 90%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    fill="url(#dailyScoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Scan history list */}
        <div>
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Scan History</h3>
          <div className="space-y-2.5">
            {sortedScans.map((scan) => (
              <div
                key={scan.id}
                role="button"
                tabIndex={0}
                className="w-full text-left rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-3.5 active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => onViewScan(scan)}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onViewScan(scan); } }}
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {scan.photo_front_url ? (
                    <img src={scan.photo_front_url} alt="Scan" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ScanLine className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold tabular-nums ${getScoreColor(scan.score)}`}>
                      {Math.round(scan.score * 10)}%
                    </span>
                    {scan.hairline_type && (
                      <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                        {scan.hairline_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(scan); }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors active:bg-secondary/50"
                    aria-label={scan.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${scan.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/40'}`} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors active:bg-destructive/10"
                        aria-label="Delete scan"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground/40" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this scan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This scan will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteScan(scan.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily tip */}
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Daily Tip</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{todaysTip}</p>
            </div>
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-24 flex-shrink-0" />
      </div>
    </div>
  );
};
