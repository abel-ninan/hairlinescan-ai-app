import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Scan } from '@/types/database';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Calendar,
  Sparkles,
  Crown,
  Lock,
  ChevronRight,
  BarChart3,
  Zap,
  Shield,
  Star,
  Loader2
} from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

interface InsightsScreenProps {
  onUpgrade: () => void;
  onNewScan: () => void;
}

interface InsightData {
  scans: Scan[];
  averageScore: number;
  bestScore: number;
  worstScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  consistency: number;
  weeklyAverage: number;
  monthlyAverage: number;
  radarData: { subject: string; value: number; fullMark: number }[];
}

export const InsightsScreen = ({ onUpgrade, onNewScan }: InsightsScreenProps) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isPremium, setIsPremium] = useState(false); // Would come from subscription status

  useEffect(() => {
    if (user) {
      fetchInsights();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      const { data: scans, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!scans || scans.length === 0) {
        setInsights(null);
        setLoading(false);
        return;
      }

      const typedScans = scans as Scan[];

      // Calculate insights
      const scores = typedScans.map(s => s.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);

      // Calculate trend
      const recentScans = typedScans.slice(0, 5);
      const olderScans = typedScans.slice(5, 10);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let trendPercentage = 0;

      if (olderScans.length > 0) {
        const recentAvg = recentScans.reduce((a, b) => a + b.score, 0) / recentScans.length;
        const olderAvg = olderScans.reduce((a, b) => a + b.score, 0) / olderScans.length;
        trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (trendPercentage > 5) trend = 'up';
        else if (trendPercentage < -5) trend = 'down';
      }

      // Calculate consistency (lower variance = higher consistency)
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
      const consistency = Math.max(0, Math.min(100, 100 - (variance * 10)));

      // Weekly and monthly averages
      const weekAgo = subDays(new Date(), 7);
      const monthAgo = subDays(new Date(), 30);
      const weeklyScans = typedScans.filter(s => new Date(s.created_at) >= weekAgo);
      const monthlyScans = typedScans.filter(s => new Date(s.created_at) >= monthAgo);

      const weeklyAverage = weeklyScans.length > 0
        ? weeklyScans.reduce((a, b) => a + b.score, 0) / weeklyScans.length
        : 0;
      const monthlyAverage = monthlyScans.length > 0
        ? monthlyScans.reduce((a, b) => a + b.score, 0) / monthlyScans.length
        : 0;

      // Calculate radar data from latest scan metrics
      const latestScan = typedScans[0];
      const metrics = latestScan.metrics as any || {};
      const radarData = [
        { subject: 'Symmetry', value: metrics.symmetry || avgScore, fullMark: 10 },
        { subject: 'Definition', value: metrics.definition || avgScore * 0.9, fullMark: 10 },
        { subject: 'Fullness', value: metrics.fullness || avgScore * 0.95, fullMark: 10 },
        { subject: 'Structure', value: metrics.structure || avgScore * 0.85, fullMark: 10 },
        { subject: 'Texture', value: metrics.texture || avgScore * 0.92, fullMark: 10 },
      ];

      setInsights({
        scans: typedScans,
        averageScore: avgScore,
        bestScore,
        worstScore,
        trend,
        trendPercentage,
        consistency,
        weeklyAverage,
        monthlyAverage,
        radarData
      });
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6 flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Sign in to see insights</h2>
          <p className="text-muted-foreground mb-6">
            Track your progress and get detailed analytics about your hairline over time.
          </p>
        </div>
      </div>
    );
  }

  if (!insights || insights.scans.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6 pb-24">
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Detailed analytics and progress</p>
        </div>

        <div className="glass-panel p-8 text-center mx-6">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">More scans needed</h2>
          <p className="text-muted-foreground mb-6">
            Complete at least 2 scans to unlock detailed insights and progress tracking.
          </p>
          <Button onClick={onNewScan}>
            Start Scanning
          </Button>
        </div>
      </div>
    );
  }

  // Chart data for trend
  const chartData = insights.scans
    .slice()
    .reverse()
    .slice(-14)
    .map(scan => ({
      date: format(new Date(scan.created_at), 'MMM d'),
      score: scan.score
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Detailed analytics and progress</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Average</span>
            </div>
            <p className="text-2xl font-bold">{insights.averageScore.toFixed(1)}</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Best</span>
            </div>
            <p className="text-2xl font-bold">{insights.bestScore.toFixed(1)}</p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              {insights.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {insights.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {insights.trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">Trend</span>
            </div>
            <p className={`text-2xl font-bold ${
              insights.trend === 'up' ? 'text-green-500' :
              insights.trend === 'down' ? 'text-red-500' : ''
            }`}>
              {insights.trend === 'up' && '+'}
              {insights.trendPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Consistency</span>
            </div>
            <p className="text-2xl font-bold">{insights.consistency.toFixed(0)}%</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-panel p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Current Profile
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={insights.radarData}>
                <PolarGrid stroke="hsl(220, 25%, 20%)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="hsl(217, 91%, 60%)"
                  fill="hsl(217, 91%, 60%)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="glass-panel p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Score History
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 20%)" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(220, 10%, 50%)"
                  tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="hsl(220, 10%, 50%)"
                  tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 25%, 12%)',
                    border: '1px solid hsl(220, 25%, 25%)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  fill="url(#insightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Period Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-xl font-bold">
              {insights.weeklyAverage > 0 ? insights.weeklyAverage.toFixed(1) : 'N/A'}
            </p>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <p className="text-xl font-bold">
              {insights.monthlyAverage > 0 ? insights.monthlyAverage.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Premium Upsell */}
        {!isPremium && (
          <div className="glass-panel p-5 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unlock Premium Insights</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get detailed reports, comparisons, predictions, and personalized recommendations.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">AI Predictions</span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">Export Reports</span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">Comparisons</span>
                </div>
                <Button onClick={onUpgrade} size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips Based on Data */}
        <div className="glass-panel p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Personalized Tips
          </h3>
          <div className="space-y-3">
            {insights.consistency < 70 && (
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <Target className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Improve Consistency</p>
                  <p className="text-sm text-muted-foreground">
                    Your scores vary a lot. Try scanning under similar lighting conditions for more accurate tracking.
                  </p>
                </div>
              </div>
            )}
            {insights.trend === 'down' && (
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Trend Alert</p>
                  <p className="text-sm text-muted-foreground">
                    Your recent scores are lower. This might be due to photo quality or actual changes. Consider reviewing your hair care routine.
                  </p>
                </div>
              </div>
            )}
            {insights.trend === 'up' && (
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Great Progress!</p>
                  <p className="text-sm text-muted-foreground">
                    Your scores are improving. Keep up the good work with your current routine!
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Regular Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Scan weekly for the most accurate progress tracking. You have {insights.scans.length} scans so far.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
