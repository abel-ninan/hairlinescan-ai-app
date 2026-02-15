import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Calendar,
  Trash2,
  Download,
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
  Crown,
  Star
} from 'lucide-react';

interface SettingsScreenProps {
  onNavigateToAuth: () => void;
}

export const SettingsScreen = ({ onNavigateToAuth }: SettingsScreenProps) => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.full_name || '');

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast({ title: 'Please enter a name', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile({ full_name: newName.trim() });
    setLoading(false);

    if (error) {
      toast({ title: 'Error updating name', variant: 'destructive' });
    } else {
      toast({ title: 'Name updated' });
      setEditingName(false);
    }
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!profile) return;

    const newPreferences = {
      ...profile.preferences,
      [key]: value
    };

    const { error } = await updateProfile({ preferences: newPreferences } as any);

    if (error) {
      toast({ title: 'Error updating settings', variant: 'destructive' });
    }
  };

  const handleUpdateReminderFrequency = async (value: string) => {
    if (!profile) return;

    const newPreferences = {
      ...profile.preferences,
      reminder_frequency: value
    };

    const { error } = await updateProfile({ preferences: newPreferences } as any);

    if (error) {
      toast({ title: 'Error updating settings', variant: 'destructive' });
    } else {
      toast({ title: 'Reminder frequency updated' });
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: scans, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const exportData = {
        profile: {
          email: profile?.email,
          full_name: profile?.full_name,
          created_at: profile?.created_at,
          scan_count: profile?.scan_count
        },
        scans: scans || [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hairlinescan-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Data exported successfully' });
    } catch (err) {
      console.error('Export error:', err);
      toast({ title: 'Error exporting data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This would need server-side implementation for full account deletion
    toast({
      title: 'Account deletion requested',
      description: 'Please contact support to complete account deletion.'
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6 flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Sign in to access settings</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to save your scans, track progress, and personalize your experience.
          </p>
          <Button onClick={onNavigateToAuth} className="w-full">
            Sign In / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Section */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Profile
          </h3>

          <div className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateName} disabled={loading} size="sm">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      onClick={() => setEditingName(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold">{profile?.full_name || 'No name set'}</p>
                    <button
                      onClick={() => {
                        setNewName(profile?.full_name || '');
                        setEditingName(true);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit name
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile?.email}</span>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">
                  Member since{' '}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Scan Count */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile?.scan_count || 0} total scans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Section */}
        <div className="glass-panel p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Upgrade to Premium</p>
                <p className="text-sm text-muted-foreground">
                  Unlock detailed reports & comparisons
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get reminders and updates</p>
                </div>
              </div>
              <Switch
                checked={profile?.preferences?.notifications_enabled ?? true}
                onCheckedChange={(checked) =>
                  handleTogglePreference('notifications_enabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Scan Reminders</p>
                  <p className="text-sm text-muted-foreground">Regular check-in reminders</p>
                </div>
              </div>
              <Switch
                checked={profile?.preferences?.scan_reminders ?? true}
                onCheckedChange={(checked) =>
                  handleTogglePreference('scan_reminders', checked)
                }
              />
            </div>

            {profile?.preferences?.scan_reminders && (
              <div className="flex items-center justify-between pl-8">
                <p className="text-sm">Reminder Frequency</p>
                <Select
                  value={profile?.preferences?.reminder_frequency || 'weekly'}
                  onValueChange={handleUpdateReminderFrequency}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Progress summary emails</p>
                </div>
              </div>
              <Switch
                checked={profile?.preferences?.weekly_reports ?? true}
                onCheckedChange={(checked) =>
                  handleTogglePreference('weekly_reports', checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Appearance
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
            </div>
            <Switch
              checked={profile?.preferences?.dark_mode ?? true}
              onCheckedChange={(checked) =>
                handleTogglePreference('dark_mode', checked)
              }
            />
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Data & Privacy
          </h3>

          <div className="space-y-2">
            <button
              onClick={handleExportData}
              disabled={loading}
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span>Export My Data</span>
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <a
              href="/privacy-policy.html"
              target="_blank"
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>

            <a
              href="/terms.html"
              target="_blank"
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span>Terms of Service</span>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Support Section */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Support
          </h3>

          <div className="space-y-2">
            <a
              href="/support.html"
              target="_blank"
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>Help & FAQ</span>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>

            <button
              onClick={() => {
                // Would open app store review prompt
                toast({ title: 'Thanks for your support!' });
              }}
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-muted-foreground" />
                <span>Rate the App</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-4 border-destructive/30">
          <h3 className="text-sm font-medium text-destructive mb-4 uppercase tracking-wider">
            Danger Zone
          </h3>

          <div className="space-y-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between py-3 hover:bg-destructive/10 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <span className="text-destructive">Delete Account</span>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your data, including scan history
                    and progress, will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-muted-foreground" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            HairlineScan v1.2.0
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for your hair
          </p>
        </div>
      </div>
    </div>
  );
};
