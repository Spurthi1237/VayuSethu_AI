import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { DashboardTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewSection } from './components/overview/OverviewSection';
import { LiveAirQualitySection } from './components/live/LiveAirQualitySection';
import { AIPredictionSection } from './components/prediction/AIPredictionSection';
import { HealthAdvisorSection } from './components/health/HealthAdvisorSection';
import { PollutionInsightsSection } from './components/insights/PollutionInsightsSection';
import { SmartRouteOptimizerSection } from './components/route/SmartRouteOptimizerSection';
import { CrowdsourcedMapSection } from './components/crowdsource/CrowdsourcedMapSection';
import { VayuAICopilot } from './components/ai/VayuAICopilot';
import type { StationData } from './types/airQuality';
import { useAirQualityData } from './hooks/useAirQualityData';
import { VayuSethuSidebarLogo, VayuSethuEmblem } from './components/brand/Logo';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Live real data hook connected to Open-Meteo Air Quality API
  const {
    data: liveData,
    cpcbResult,
    loading,
    refreshing,
    error,
    refetch,
    lastUpdatedFormatted,
  } = useAirQualityData();

  // Tab metadata titles and subtitles
  const getTabMeta = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: 'Executive Air Quality Intelligence',
          subtitle: 'Real-time aggregated index, criteria pollutants, and diurnal forecasts for Bengaluru',
        };
      case 'live':
        return {
          title: 'Spatial Grid & Hotspots',
          subtitle: 'Real-time CPCB / KSPCB continuous monitoring stations across Bengaluru (via WAQI)',
        };
      case 'route':
        return {
          title: 'Smart Clean-Air Route Optimizer',
          subtitle: 'Lowest-exposure walking and cycling corridors bypassing vehicular diesel bottlenecks',
        };
      case 'crowdsource':
        return {
          title: 'Crowdsourced Visual Sky & Haze Map',
          subtitle: 'Citizen skyline photographs evaluated by Gemini Multimodal Computer Vision for optical haze',
        };
      case 'prediction':
        return {
          title: 'Air Quality Forecast',
          subtitle: '24-hour predictive trajectory grounded in live CPCB sensor telemetry and diurnal models',
        };
      case 'health':
        return {
          title: 'Public Health & Exposure Guidance',
          subtitle: 'Targeted respiratory advisories for sensitive demographics, athletes, and school districts',
        };
      case 'insights':
        return {
          title: 'Source Apportionment & Pollution Drivers',
          subtitle: 'Sectoral emission attribution isolating vehicular, construction dust, and industrial factors',
        };
    }
  };

  const { title, subtitle } = getTabMeta();

  // Telemetry Context prepared for Gemini AI Copilot & Advisors
  const telemetryContext = {
    aqi: cpcbResult?.aqi ?? liveData?.current.us_aqi,
    category: cpcbResult?.category,
    dominantPollutant: cpcbResult?.dominantPollutantKey,
    pm25: liveData?.current.pm2_5,
    pm10: liveData?.current.pm10,
    no2: liveData?.current.nitrogen_dioxide,
    so2: liveData?.current.sulphur_dioxide,
    co: liveData?.current.carbon_monoxide,
    o3: liveData?.current.ozone,
    stationName: selectedStation?.name || 'Bengaluru Central',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ivory text-charcoal">
      {/* Desktop / Collapsible Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Navigation Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-forest text-ivory border-r border-[#14332A] shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[#235747]">
              <VayuSethuSidebarLogo isCollapsed={false} />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#14332A] text-sage-light hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setMobileMenuOpen(false);
                }}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-ivory">
        {/* Sticky Header with real refresh & last retrieval time */}
        <Header
          currentTabTitle={title}
          currentTabSubtitle={subtitle}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onRefresh={refetch}
          isRefreshing={refreshing}
          lastRetrievalTime={lastUpdatedFormatted}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {currentTab === 'overview' && (
            <OverviewSection
              liveData={liveData}
              cpcbResult={cpcbResult}
              loading={loading}
              refreshing={refreshing}
              error={error}
              lastUpdated={lastUpdatedFormatted}
              onRetry={refetch}
              onNavigateToLive={() => setCurrentTab('live')}
              onNavigateToAI={() => setCurrentTab('prediction')}
            />
          )}

          {currentTab === 'live' && (
            <LiveAirQualitySection
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          )}

          {currentTab === 'route' && (
            <SmartRouteOptimizerSection />
          )}

          {currentTab === 'crowdsource' && (
            <CrowdsourcedMapSection />
          )}

          {currentTab === 'prediction' && (
            <AIPredictionSection 
              hourlyForecast={liveData?.hourlyNext24h}
              loading={loading}
              error={error}
              onRetry={refetch}
            />
          )}

          {currentTab === 'health' && (
            <HealthAdvisorSection telemetryContext={telemetryContext} />
          )}

          {currentTab === 'insights' && (
            <PollutionInsightsSection />
          )}

          {/* Gemini-Powered Atmospheric & Health Copilot */}
          <VayuAICopilot telemetryContext={telemetryContext} />

          {/* Clean Editorial Footer */}
          <footer className="pt-8 pb-6 text-center text-xs text-charcoal-muted border-t border-sage/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <VayuSethuEmblem className="w-5 h-5" />
              <span className="font-serif font-bold text-forest">VAYU SETHU</span>
              <span className="text-sage">•</span>
              <span className="italic font-serif text-charcoal-muted">One platform. Every breath accounted for.</span>
            </div>
            <div className="text-charcoal-muted text-[11px]">
              Continuous Ambient Air Quality (CPCB / KSPCB via WAQI) & Gemini AI • Bengaluru (12.9716°N, 77.5946°E)
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
