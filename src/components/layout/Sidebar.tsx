import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Sparkles, 
  HeartPulse, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Globe2,
  Navigation,
  Camera
} from 'lucide-react';
import { VayuSethuSidebarLogo, VayuSethuEmblem } from '../brand/Logo';

export type DashboardTab = 
  | 'overview' 
  | 'live' 
  | 'route'
  | 'crowdsource'
  | 'prediction' 
  | 'health' 
  | 'insights';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedStationName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems: { id: DashboardTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Spatial Grid & Hotspots', icon: MapPin, badge: 'Live CPCB' },
    { id: 'route', label: 'Smart Route Optimizer', icon: Navigation, badge: 'Clean Air' },
    { id: 'crowdsource', label: 'Visual Sky Map', icon: Camera, badge: 'AI Vision' },
    { id: 'prediction', label: 'Air Quality Forecast', icon: Sparkles, badge: '24h Forecast' },
    { id: 'health', label: 'Health Advisor', icon: HeartPulse },
    { id: 'insights', label: 'Pollution Insights', icon: BarChart3 },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen bg-forest-800 text-ivory border-r border-[#14332A] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{ backgroundColor: '#183D32' }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#235747]">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          {isCollapsed ? (
            <VayuSethuEmblem className="w-10 h-10 mx-auto" />
          ) : (
            <VayuSethuSidebarLogo isCollapsed={false} />
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded bg-[#14332A] text-sage-light hover:text-ivory hover:bg-[#235747] transition-colors ml-2 flex-shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className={`px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Platform Modules'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-ivory text-forest font-semibold shadow-sidebar-nav'
                  : 'text-ivory/80 hover:text-ivory hover:bg-[#235747]/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              {/* Subtle gold indicator pip for active tab */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gold rounded-r" />
              )}

              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-forest' : 'text-sage-light group-hover:text-ivory'
                }`}
                strokeWidth={1.8}
              />
              
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate tracking-wide">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-forest/10 text-forest'
                          : 'bg-[#14332A] text-sage-light'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Node Status: Transparent Real API Connection */}
      <div className="p-3 border-t border-[#235747] bg-[#14332A]/50">
        {!isCollapsed ? (
          <div className="p-3 rounded-lg bg-[#14332A] border border-[#235747] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sage-light flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                CPCB Live (WAQI)
              </span>
              <span className="font-mono text-emerald-300 text-[11px] font-medium">Connected</span>
            </div>
            <div className="text-[10px] text-sage flex items-center justify-between pt-1 border-t border-[#235747]/60">
              <span className="flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-gold" /> Bengaluru Grid
              </span>
              <span className="font-mono text-ivory text-[9px]">
                12.97°N, 77.59°E
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2" title="Open-Meteo CAMS: Connected">
            <div className="w-2 h-2 rounded-full bg-gold"></div>
          </div>
        )}
      </div>
    </aside>
  );
};
