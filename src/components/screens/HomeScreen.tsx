import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Scan } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ScanLine,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Calendar,
  ChevronRight,
  Sparkles,
  Target,
  Flame,
  Clock,
  Star,
  ArrowRight,
  BarChart3,
  User,
  Lightbulb
} from 'lucide-react';

interface HomeScreenProps {
  onStartScan: () => void;
  onViewHistory: () => void;
  onViewScan: (scan: Scan) => void;
  onSignIn: () => void;
}

export const HomeScreen = ({
  onStartScan,
  onViewHistory,
  onViewScan,
  onSignIn
}: HomeScreenProps) => {
  const { user, profile } = useAuth();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRecentScans();
      calculateStreak();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentScans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentScans((data as Scan[]) || []);
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setStreak(0);
        return;
      }

      // Simple streak calculation (days with scans)
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scanDates = data.map(s => {
        const d = new Date(s.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      const uniqueDates = [...new Set(scanDates)].sort((a, b) => b - a);

      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        if (uniqueDates[i] === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (err) {
      console.error('Error calculating streak:', err);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate trend
  const getTrend = () => {
    if (recentScans.length < 2) return 'stable';
    const recent = recentScans[0].score;
    const previous = recentScans[1].score;
    if (recent > previous + 0.3) return 'up';
    if (recent < previous - 0.3) return 'down';
    return 'stable';
  };

  // Daily tips
  const dailyTips = [
    "Maintain a consistent hair care routine for best results",
    "Stay hydrated - it affects your hair health too",
    "Consider a gentle scalp massage during shampooing",
    "Protect your hairline from sun exposure",
    "Regular trims help maintain a polished appearance"
  ];
  const todaysTip = dailyTips[new Date().getDay() % dailyTips.length];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-2xl font-bold">
              {profile?.full_name || (user ? 'Welcome' : 'Welcome to HairlineScan')}
            </h1>
          </div>
          {user && profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          ) : user ? (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Quick Scan CTA */}
        <div className="glass-panel p-6 bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/30 flex items-center justify-center">
              <ScanLine className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Ready for a scan?</h2>
              <p className="text-sm text-muted-foreground">
                Track your hairline appearance
              </p>
            </div>
          </div>
          <Button onClick={onStartScan} className="w-full mt-4" size="lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Start New Scan
          </Button>
        </div>

        {/* Stats Row (for authenticated users) */}
        {user && (
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-4 text-center">
              <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{profile?.scan_count || 0}</p>
              <p className="text-xs text-muted-foreground">Scans</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="glass-panel p-4 text-center">
              {getTrend() === 'up' && <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />}
              {getTrend() === 'down' && <TrendingDown className="w-5 h-5 mx-auto mb-1 text-red-500" />}
              {getTrend() === 'stable' && <Minus className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />}
              <p className="text-xl font-bold capitalize">{getTrend()}</p>
              <p className="text-xs text-muted-foreground">Trend</p>
            </div>
          </div>
        )}

        {/* Sign In Prompt (for unauthenticated users) */}
        {!user && (
          <div className="glass-panel p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Create an account</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to save your scans, track progress, and get personalized insights.
                </p>
                <Button onClick={onSignIn} variant="outline" size="sm">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        {user && recentScans.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Scans</h3>
              <button
                onClick={onViewHistory}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onViewScan(scan)}
                  className="glass-panel p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Score: {scan.score.toFixed(1)}
                      </span>
                      {scan.is_favorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Tip */}
        <div className="glass-panel p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Tip of the Day</h3>
              <p className="text-sm text-muted-foreground">{todaysTip}</p>
            </div>
          </div>
        </div>

        {/* Features Grid (for unauthenticated users) */}
        {!user && (
          <div>
            <h3 className="font-semibold mb-3">What you can do</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-4">
                <ScanLine className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-medium mb-1">AI Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Get instant hairline assessment
                </p>
              </div>
              <div className="glass-panel p-4">
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <h4 className="font-medium mb-1">Track Progress</h4>
                <p className="text-xs text-muted-foreground">
                  Monitor changes over time
                </p>
              </div>
              <div className="glass-panel p-4">
                <Target className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-medium mb-1">Personal Tips</h4>
                <p className="text-xs text-muted-foreground">
                  Get customized recommendations
                </p>
              </div>
              <div className="glass-panel p-4">
                <Award className="w-8 h-8 text-yellow-500 mb-2" />
                <h4 className="font-medium mb-1">Achievements</h4>
                <p className="text-xs text-muted-foreground">
                  Earn badges for consistency
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Preview */}
        {user && profile && profile.scan_count > 0 && (
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Achievements</h3>
              <span className="text-xs text-muted-foreground">
                {Math.min(profile.scan_count, 5)} / 9 unlocked
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ScanLine className="w-8 h-8 text-primary" />
              </div>
              {profile.scan_count >= 5 && (
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              )}
              {profile.scan_count >= 10 && (
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              )}
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                <span className="text-2xl text-muted-foreground">?</span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Your photos are analyzed securely and never stored.
            <br />
            <a href="/privacy-policy.html" className="text-primary hover:underline">
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
