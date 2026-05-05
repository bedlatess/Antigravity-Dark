"use client";

import React, { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Activity, ArrowUpRight, Zap, Search, LayoutGrid, List } from "lucide-react";

import NodeDisplay from "@/components/NodeDisplay";
import { formatBytes } from "@/utils/unitHelper";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { useTheme } from "@/contexts/ThemeContext";
import Loading from "@/components/loading";
import { CurrentTimeCard } from "@/components/CurrentTimeCard";
import { Callouts } from "@/components/DashboardCallouts";
import { NodeMapView } from "@/components/NodeMapView";
import { useStatusCardsVisibility } from "@/hooks/useStatusCardsVisibility";

// --- 极简二次元风格统计卡片 ---
const AnimeStatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="anime-card p-4 flex flex-col gap-3 group/card relative overflow-hidden min-h-[100px]">
    <div className="flex justify-between items-center relative z-10">
      <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{title}</span>
      <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover/card:text-white/100 transition-colors">
        {Icon}
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-2xl font-black tracking-tighter font-mono" style={{ color }}>
        {value}
      </div>
    </div>
    <div className="absolute -right-2 -bottom-4 opacity-[0.02] italic font-black text-6xl pointer-events-none select-none">
      DATA
    </div>
  </div>
);

export default function DashboardContent() {
  const { t } = useTranslation();
  const { live_data } = useLiveData();
  const { publicInfo } = usePublicInfo();
  const { themeConfig } = useTheme();
  
  useEffect(() => {
    if (publicInfo?.sitename) {
      document.title = publicInfo.sitename;
    }
  }, [publicInfo?.sitename]);
  
  const { nodeList, isLoading, error, refresh } = useNodeList();
  const [statusCardsVisibility] = useStatusCardsVisibility();

  useEffect(() => {
    const interval = setInterval(() => refresh(), 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-rose-400 p-8 text-center anime-card">Error: {error}</div>;

  const data = live_data?.data?.data;
  const onlineSet = new Set(live_data?.data?.online || []);
  const activeNodes = Object.entries(data || {}).filter(([uuid]) => onlineSet.has(uuid)).map(([, n]) => n);

  const totalUp = activeNodes.reduce((acc, n) => acc + (n.network.totalUp || 0), 0);
  const totalDown = activeNodes.reduce((acc, n) => acc + (n.network.totalDown || 0), 0);
  const speedDown = activeNodes.reduce((acc, n) => acc + (n.network.down || 0), 0);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-1000">
      
      <Callouts />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCardsVisibility.currentTime && (
          <div className="anime-card p-4 flex flex-col justify-center min-h-[100px]">
             <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">{t("current_time")}</span>
             <CurrentTimeCard />
          </div>
        )}
        
        {statusCardsVisibility.currentOnline && (
          <AnimeStatCard 
            title={t("current_online")}
            value={`${onlineSet.size} / ${nodeList?.length || 0}`}
            icon={<Activity size={14}/>}
            color="#34d399"
          />
        )}

        {statusCardsVisibility.trafficOverview && (
          <AnimeStatCard 
            title="Total Traffic"
            value={`↑${formatBytes(totalUp)}`}
            icon={<ArrowUpRight size={14}/>}
            color="#a855f7"
          />
        )}

        {statusCardsVisibility.networkSpeed && (
          <AnimeStatCard 
            title="Realtime Speed"
            value={`↓${formatBytes(speedDown)}/s`}
            icon={<Zap size={14}/>}
            color="#fbbf24"
          />
        )}
      </div>

      {statusCardsVisibility.mapView && (
        <div className="anime-card overflow-hidden p-1 bg-black/20 border border-white/5">
          <NodeMapView
            nodes={nodeList ?? []}
            liveData={live_data?.data ?? { online: [], data: {} }}
            mapOnly
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-white/90">
            Probe <span className="text-purple-500">Fleet</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 opacity-30 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-all" />
            <input 
              type="text" 
              placeholder="Search endpoints..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:opacity-30 text-white"
            />
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {/* 修正点：将对比值改为符合 CardLayout 类型的 'modern' 和 'classic' */}
            <button className={`p-1.5 rounded-md transition-all ${themeConfig.cardLayout === 'modern' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}>
              <LayoutGrid size={14} />
            </button>
            <button className={`p-1.5 rounded-md transition-all ${themeConfig.cardLayout === 'classic' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="p-12 text-center animate-pulse opacity-50 uppercase tracking-[0.3em] text-xs">Synchronizing Nodes...</div>}>
        <NodeDisplay
          nodes={nodeList ?? []}
          liveData={live_data?.data ?? { online: [], data: {} }}
        />
      </Suspense>
    </div>
  );
}