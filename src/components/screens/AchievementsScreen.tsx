import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Award,
  Star,
  Flame,
  TrendingUp,
  Crown,
  Rocket,
  Medal,
  Trophy,
  ScanLine,
  Lock,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  unlocked: boolean;
  unlocked_at?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'scan': <ScanLine className="w-6 h-6" />,
  'trending-up': <TrendingUp className="w-6 h-6" />,
  'award': <Award className="w-6 h-6" />,
  'star': <Star className="w-6 h-6" />,
  'crown': <Crown className="w-6 h-6" />,
  'trophy': <Trophy className="w-6 h-6" />,
  'flame': <Flame className="w-6 h-6" />,
  'medal': <Medal className="w-6 h-6" />,
  'rocket': <Rocket className="w-6 h-6" />,
};

const colorMap: Record<string, string> = {
  'scan_count': 'from-blue-500 to-cyan-500',
  'streak': 'from-orange-500 to-red-500',
  'score': 'from-yellow-500 to-amber-500',
  'special': 'from-purple-500 to-pink-500',
};

interface AchievementsScreenProps {
  onNewScan: () => void;
}

export const AchievementsScreen = ({ onNewScan }: AchievementsScreenProps) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchAchievements();
  }, [user, profile]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achError) throw achError;

      // If user is logged in, fetch their unlocked achievements
      let unlockedIds: string[] = [];
      if (user) {
        const { data: userAchievements, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);

        if (!userError && userAchievements) {
          unlockedIds = userAchievements.map(ua => ua.achievement_id);
        }
      }

      // Combine and calculate progress
      const combined = (allAchievements || []).map(ach => ({
        ...ach,
        unlocked: unlockedIds.includes(ach.id) || checkAchievementProgress(ach, profile?.scan_count || 0)
      }));

      setAchievements(combined);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      // Use default achievements if database fails
      setAchievements(getDefaultAchievements(profile?.scan_count || 0));
    } finally {
      setLoading(false);
    }
  };

  const checkAchievementProgress = (achievement: any, scanCount: number): boolean => {
    if (achievement.requirement_type === 'scan_count') {
      return scanCount >= achievement.requirement_value;
    }
    return false;
  };

  const getProgress = (achievement: Achievement): number => {
    if (achievement.unlocked) return 100;

    const scanCount = profile?.scan_count || 0;
    if (achievement.requirement_type === 'scan_count') {
      return Math.min(100, (scanCount / achievement.requirement_value) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Track your milestones</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Progress Overview */}
        <div className="glass-panel p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {unlockedCount} / {totalCount}
          </p>
          <p className="text-muted-foreground text-sm">Achievements Unlocked</p>
          <div className="w-full h-2 bg-secondary rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-4">
          {/* Unlocked Achievements */}
          {achievements.filter(a => a.unlocked).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Unlocked
              </h3>
              <div className="space-y-3">
                {achievements.filter(a => a.unlocked).map(achievement => (
                  <div
                    key={achievement.id}
                    className="glass-panel p-4 flex items-center gap-4"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[achievement.requirement_type] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                      {iconMap[achievement.icon] || <Award className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {achievements.filter(a => !a.unlocked).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" />
                In Progress
              </h3>
              <div className="space-y-3">
                {achievements.filter(a => !a.unlocked).map(achievement => {
                  const progress = getProgress(achievement);

                  return (
                    <div
                      key={achievement.id}
                      className="glass-panel p-4 opacity-75"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                          {iconMap[achievement.icon] || <Award className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colorMap[achievement.requirement_type] || 'from-gray-400 to-gray-500'} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        {progress.toFixed(0)}% complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Motivational CTA */}
        {!user ? (
          <div className="glass-panel p-6 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Sign in to track achievements</h3>
            <p className="text-sm text-muted-foreground">
              Create an account to save your progress and earn achievements.
            </p>
          </div>
        ) : achievements.filter(a => !a.unlocked).length > 0 && (
          <div className="glass-panel p-6 text-center">
            <Flame className="w-10 h-10 mx-auto mb-4 text-orange-500" />
            <h3 className="font-semibold mb-2">Keep going!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You're making great progress. Complete more scans to unlock achievements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Default achievements if database fails
function getDefaultAchievements(scanCount: number): Achievement[] {
  return [
    {
      id: '1',
      name: 'First Scan',
      description: 'Complete your first hairline scan',
      icon: 'scan',
      requirement_type: 'scan_count',
      requirement_value: 1,
      unlocked: scanCount >= 1
    },
    {
      id: '2',
      name: 'Getting Started',
      description: 'Complete 5 scans',
      icon: 'trending-up',
      requirement_type: 'scan_count',
      requirement_value: 5,
      unlocked: scanCount >= 5
    },
    {
      id: '3',
      name: 'Dedicated',
      description: 'Complete 10 scans',
      icon: 'award',
      requirement_type: 'scan_count',
      requirement_value: 10,
      unlocked: scanCount >= 10
    },
    {
      id: '4',
      name: 'Hair Expert',
      description: 'Complete 25 scans',
      icon: 'star',
      requirement_type: 'scan_count',
      requirement_value: 25,
      unlocked: scanCount >= 25
    },
    {
      id: '5',
      name: 'Scan Master',
      description: 'Complete 50 scans',
      icon: 'crown',
      requirement_type: 'scan_count',
      requirement_value: 50,
      unlocked: scanCount >= 50
    },
    {
      id: '6',
      name: 'Perfect Score',
      description: 'Achieve a score of 9 or higher',
      icon: 'trophy',
      requirement_type: 'score',
      requirement_value: 9,
      unlocked: false
    },
    {
      id: '7',
      name: 'Consistent',
      description: 'Scan for 7 days in a row',
      icon: 'flame',
      requirement_type: 'streak',
      requirement_value: 7,
      unlocked: false
    },
    {
      id: '8',
      name: 'Monthly Warrior',
      description: 'Scan for 30 days in a row',
      icon: 'medal',
      requirement_type: 'streak',
      requirement_value: 30,
      unlocked: false
    },
    {
      id: '9',
      name: 'Early Adopter',
      description: 'Join during launch period',
      icon: 'rocket',
      requirement_type: 'special',
      requirement_value: 1,
      unlocked: true
    }
  ];
}
