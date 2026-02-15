import { Home, ScanLine, History, Settings, User } from 'lucide-react';

export type TabType = 'home' | 'scan' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAuthenticated: boolean;
}

interface NavItem {
  id: TabType;
  icon: React.ReactNode;
  label: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Home' },
  { id: 'scan', icon: <ScanLine className="w-6 h-6" />, label: 'Scan' },
  { id: 'history', icon: <History className="w-6 h-6" />, label: 'History' },
  { id: 'settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
];

export const BottomNav = ({ activeTab, onTabChange, isAuthenticated }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`relative transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {item.icon}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
