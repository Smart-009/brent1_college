import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { PanicButton } from './components/PanicButton';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { BrokerConnectScreen } from './screens/BrokerConnectScreen';
import { PositionsScreen } from './screens/PositionsScreen';
import { RiskSettingsScreen } from './screens/RiskSettingsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { RadarScreen } from './screens/RadarScreen';
import { EducationScreen } from './screens/EducationScreen';
import { TradeScreen } from './screens/TradeScreen';
import { api } from './api/client';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [positionCount, setPositionCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'KES'>('USD');
  const [activeTradeSymbol, setActiveTradeSymbol] = useState<string>('XAUUSD');

  const fetchPositionCount = async () => {
    try {
      const res = await api.getPositions();
      setPositionCount(res.positions?.length || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchPositionCount();
      const interval = setInterval(fetchPositionCount, 3500);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchPositionCount();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleNavigateToTradeWithSymbol = (symbol?: string) => {
    if (symbol) setActiveTradeSymbol(symbol);
    setCurrentTab('trade');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-[#848e9c]">
        <div className="w-9 h-9 rounded-full border-2 border-[#0ecb81] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f0f4f8] flex flex-col antialiased selection:bg-[#0ecb81] selection:text-black">
      <Header 
        onRefresh={handleManualRefresh} 
        refreshing={refreshing}
        currencyMode={currencyMode}
        onToggleCurrency={setCurrencyMode}
        onNavigateToBroker={() => setCurrentTab('broker')}
      />

      <main className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToPositions={() => setCurrentTab('positions')}
            onNavigateToBroker={() => setCurrentTab('broker')}
            onNavigateToTrade={handleNavigateToTradeWithSymbol}
            currencyMode={currencyMode}
          />
        )}
        {currentTab === 'trade' && (
          <TradeScreen 
            onOrderPlaced={fetchPositionCount} 
            onNavigateToBroker={() => setCurrentTab('broker')}
            initialSymbol={activeTradeSymbol}
          />
        )}
        {currentTab === 'radar' && <RadarScreen />}
        {currentTab === 'positions' && <PositionsScreen />}
        {currentTab === 'academy' && <EducationScreen />}
        {currentTab === 'broker' && <BrokerConnectScreen onBack={() => setCurrentTab('dashboard')} />}
        {currentTab === 'history' && <HistoryScreen onBack={() => setCurrentTab('dashboard')} />}
        {currentTab === 'settings' && (
          <RiskSettingsScreen
            onNavigateToBroker={() => setCurrentTab('broker')}
            onNavigateToHistory={() => setCurrentTab('history')}
          />
        )}
      </main>

      {/* Floating Emergency Panic Button (Liquidate 100% & Safe Pause) */}
      <PanicButton onSuccess={() => {
        fetchPositionCount();
        setCurrentTab('dashboard');
      }} />

      {/* Persistent Bottom Mobile Bar */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        positionCount={positionCount}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
