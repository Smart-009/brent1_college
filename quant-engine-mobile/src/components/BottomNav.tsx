import React from 'react';
import { 
  LayoutDashboard, 
  CandlestickChart, 
  Activity, 
  Layers, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export type TabType = 'dashboard' | 'trade' | 'radar' | 'positions' | 'academy' | 'broker' | 'history' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  positionCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab, positionCount = 0 }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Cockpit', icon: LayoutDashboard },
    { id: 'trade' as TabType, label: 'Trade Pad', icon: CandlestickChart },
    { id: 'positions' as TabType, label: 'Positions', icon: Layers, badge: positionCount > 0 ? positionCount : null },
    { id: 'radar' as TabType, label: 'Alpha Radar', icon: Compass },
    { id: 'settings' as TabType, label: 'Risk Guard', icon: SlidersHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/98 backdrop-blur-2xl border-t border-white/[0.07] px-2 py-1 flex justify-around items-center safe-area-pb shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive ? 'text-[#0ecb81]' : 'text-[#848e9c] hover:text-[#f0f4f8]'
            }`}
          >
            <div className="relative">
              <Icon 
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'stroke-[2.5] text-[#0ecb81] scale-110 drop-shadow-[0_0_8px_rgba(14,203,129,0.5)]' : 'stroke-[1.75]'
                }`} 
              />
              {tab.badge && (
                <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-[#0ecb81] text-[9px] font-black text-black rounded-full flex items-center justify-center shadow-lg shadow-[#0ecb81]/40 tabular-nums">
                  {tab.badge}
                </span>
              )}
            </div>
            
            <span className={`text-[9.5px] mt-1 tracking-tight font-medium ${isActive ? 'font-bold text-[#0ecb81]' : 'text-[#848e9c]'}`}>
              {tab.label}
            </span>
            
            {isActive && (
              <span className="absolute -bottom-1 w-4 h-[2px] bg-[#0ecb81] rounded-full shadow-[0_0_6px_#0ecb81]"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
