import { ScanLine, Clock, Sparkles, Settings, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'scan' | 'daily' | 'coach' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lockedTabs?: TabType[];
}

interface NavItem {
  id: TabType;
  icon: typeof ScanLine;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'scan', icon: ScanLine, label: 'Scan' },
  { id: 'daily', icon: Clock, label: 'History' },
  { id: 'coach', icon: Sparkles, label: 'Coach' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = ({ activeTab, onTabChange, lockedTabs = [] }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/80 backdrop-blur-2xl border-t border-white/[0.06] safe-area-bottom">
        <div className="flex items-center justify-around h-[52px] max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isLocked = lockedTabs.includes(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-label={isLocked ? `${item.label} (locked)` : item.label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-all duration-200 w-16 relative",
                  isLocked
                    ? "text-muted-foreground/20"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground/50 active:text-muted-foreground/70"
                )}
              >
                {isLocked ? (
                  <Lock className="w-[20px] h-[20px]" />
                ) : (
                  <Icon className={cn("w-[20px] h-[20px] transition-transform duration-200", isActive && "scale-105")} />
                )}
                <span className={cn(
                  "text-[10px] leading-tight transition-all duration-200",
                  isActive && !isLocked ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
                {/* Active indicator dot */}
                {isActive && !isLocked && (
                  <div className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
