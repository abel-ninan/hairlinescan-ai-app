import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Trash2,
  ChevronRight,
  BarChart3,
  Clock,
  Award,
  Loader2,
  ScanLine
} from 'lucide-react';
import { Scan } from '@/types/database';
import { format, formatDistanceToNow, subDays } from 'date-fns';

interface HistoryScreenProps {
  onViewScan: (scan: Scan) => void;
  onNewScan: () => void;
}

export const HistoryScreen = ({ onViewScan, onNewScan }: HistoryScreenProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'progress'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchScans();
  }, [user]);

  const fetchScans = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans((data as Scan[]) || []);
    } catch (err) {
      console.error('Error fetching scans:', err);
      toast({
        title: 'Error loading history',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (scan: Scan) => {
    try {
      const { error } = await supabase
        .from('scans')
        .update({ is_favorite: !scan.is_favorite })
        .eq('id', scan.id);

      if (error) throw error;

      setScans(scans.map(s =>
        s.id === scan.id ? { ...s, is_favorite: !s.is_favorite } : s
      ));

      toast({
        title: scan.is_favorite ? 'Removed from favorites' : 'Added to favorites'
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const deleteScan = async (scanId: string) => {
    setDeletingId(scanId);
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      setScans(scans.filter(s => s.id !== scanId));
      toast({ title: 'Scan deleted' });
    } catch (err) {
      console.error('Error deleting scan:', err);
      toast({
        title: 'Error deleting scan',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate stats
  const stats = {
    totalScans: scans.length,
    averageScore: scans.length > 0
      ? (scans.reduce((sum, s) => sum + s.score, 0) / scans.length).toFixed(1)
      : '0',
    bestScore: scans.length > 0
      ? Math.max(...scans.map(s => s.score)).toFixed(1)
      : '0',
    trend: calculateTrend(scans)
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

  // Chart data
  const chartData = scans
    .slice()
    .reverse()
    .slice(-30)
    .map(scan => ({
      date: format(new Date(scan.created_at), 'MMM d'),
      score: scan.score,
      fullDate: format(new Date(scan.created_at), 'MMM d, yyyy')
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel p-4 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{stats.totalScans}</p>
            <p className="text-xs text-muted-foreground">Total Scans</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <Award className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.bestScore}</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </div>
          <div className="glass-panel p-4 text-center">
            {stats.trend === 'up' && <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />}
            {stats.trend === 'down' && <TrendingDown className="w-5 h-5 mx-auto mb-1 text-red-500" />}
            {stats.trend === 'stable' && <Minus className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />}
            <p className="text-2xl font-bold">{stats.averageScore}</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'progress')} className="px-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3">
          {scans.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <ScanLine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first scan to track your hairline over time
              </p>
              <Button onClick={onNewScan}>
                Start Scanning
              </Button>
            </div>
          ) : (
            scans.map((scan) => (
              <div
                key={scan.id}
                className="glass-panel p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => onViewScan(scan)}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {scan.photo_front_url ? (
                    <img
                      src={scan.photo_front_url}
                      alt="Scan"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ScanLine className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Score: {scan.score.toFixed(1)}
                    </span>
                    {scan.hairline_type && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {scan.hairline_type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {scan.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(scan);
                    }}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        scan.is_favorite
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScan(scan.id);
                    }}
                    className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                    disabled={deletingId === scan.id}
                  >
                    {deletingId === scan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                    )}
                  </button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="progress">
          {scans.length < 2 ? (
            <div className="glass-panel p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Need more data</h3>
              <p className="text-muted-foreground mb-4">
                Complete at least 2 scans to see your progress chart
              </p>
              <Button onClick={onNewScan}>
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Chart */}
              <div className="glass-panel p-4">
                <h3 className="font-semibold mb-4">Score Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 20%)" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(220, 10%, 50%)"
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        stroke="hsl(220, 10%, 50%)"
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(220, 25%, 12%)',
                          border: '1px solid hsl(220, 25%, 25%)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(220, 10%, 90%)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(217, 91%, 60%)"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div className="glass-panel p-4">
                <h3 className="font-semibold mb-4">Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    {stats.trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : stats.trend === 'down' ? (
                      <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : (
                      <Minus className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {stats.trend === 'up' && 'Your scores are improving!'}
                        {stats.trend === 'down' && 'Your recent scores have decreased'}
                        {stats.trend === 'stable' && 'Your scores are consistent'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.trend === 'up' && 'Keep up the great work with your hair care routine.'}
                        {stats.trend === 'down' && 'Consider reviewing your hair care routine.'}
                        {stats.trend === 'stable' && 'You\'re maintaining a steady appearance.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Scan frequency</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.last_scan_at
                          ? `Last scan: ${formatDistanceToNow(new Date(profile.last_scan_at), { addSuffix: true })}`
                          : 'No recent scans'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Compare */}
              {scans.length >= 2 && (
                <div className="glass-panel p-4">
                  <h3 className="font-semibold mb-4">Quick Comparison</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">First Scan</p>
                      <p className="text-3xl font-bold">
                        {scans[scans.length - 1].score.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(scans[scans.length - 1].created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Latest Scan</p>
                      <p className="text-3xl font-bold">
                        {scans[0].score.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(scans[0].created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-sm">
                      Change:{' '}
                      <span className={
                        scans[0].score > scans[scans.length - 1].score
                          ? 'text-green-500'
                          : scans[0].score < scans[scans.length - 1].score
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      }>
                        {scans[0].score > scans[scans.length - 1].score ? '+' : ''}
                        {(scans[0].score - scans[scans.length - 1].score).toFixed(1)} points
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
