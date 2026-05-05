"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Activity, ArrowUpRight, Zap, Box, Send, Cpu, CloudOff, AlertTriangle } from "lucide-react";

import NodeDisplay from "@/components/NodeDisplay";
import { formatBytes } from "@/utils/unitHelper";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import Loading from "@/components/loading";
import { CurrentTimeCard } from "@/components/CurrentTimeCard";
import { NodeMapView } from "@/components/NodeMapView";
import { useStatusCardsVisibility } from "@/hooks/useStatusCardsVisibility";

// --- 增强质感统计卡片 (完全正体/优化比例) ---
const AnimeStatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
  <div className="anime-card p-6 flex flex-col gap-4 group/card relative overflow-hidden min-h-[120px] bg-black/50 border border-white/5 hover:border-purple-500/40 transition-all duration-700 backdrop-blur-3xl shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
    <div className="flex justify-between items-center relative z-10">
      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] leading-none">
        {title}
      </span>
      <div className="p-2.5 rounded-xl bg-white/5 text-white/30 group-hover/card:text-white group-hover/card:bg-purple-500/20 transition-all duration-500 border border-white/5">
        {Icon}
      </div>
    </div>
    <div className="relative z-10 flex items-baseline gap-2">
      <div 
        className="text-3xl font-bold tracking-tighter font-mono leading-none" 
        style={{ color: color, textShadow: `0 0 30px ${color}44` }}
      >
        {value}
      </div>
      {subValue && <span className="text-xs font-black text-white/10 uppercase font-mono">{subValue}</span>}
    </div>
    <div className="absolute -right-2 -bottom-4 opacity-[0.015] font-black text-6xl pointer-events-none select-none group-hover/card:opacity-[0.04] transition-all duration-1000 uppercase tracking-tighter">
      Matrix
    </div>
  </div>
);

const AnimeDivider = () => (
  <div className="flex items-center gap-4 my-8">
    <div className="w-1.5 h-6 bg-purple-600 rounded-sm shadow-[0_0_15px_#a855f7]" />
    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
  </div>
);

export default function DashboardContent() {
  const { live_data } = useLiveData();
  const { publicInfo } = usePublicInfo();
  const { nodeList, isLoading, error, refresh } = useNodeList();
  const [statusCardsVisibility] = useStatusCardsVisibility();

  useEffect(() => {
    if (publicInfo?.sitename) document.title = publicInfo.sitename;
  }, [publicInfo?.sitename]);

  useEffect(() => {
    const interval = setInterval(() => refresh(), 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // 核心统计逻辑
  const stats = useMemo(() => {
    const data = live_data?.data?.data || {};
    const onlineUuids = new Set(live_data?.data?.online || []);
    const totalCount = nodeList?.length || 0;
    
    let highLoad = 0;
    let traffic = 0;
    let speed = 0;

    nodeList?.forEach(node => {
      if (onlineUuids.has(node.uuid)) {
        const nodeStats = data[node.uuid];
        if (nodeStats) {
          if ((nodeStats.cpu?.usage || 0) > 80) highLoad++;
          traffic += (nodeStats.network?.totalUp || 0) + (nodeStats.network?.totalDown || 0);
          speed += (nodeStats.network?.down || 0);
        }
      }
    });

    return {
      online: onlineUuids.size,
      offline: Math.max(0, totalCount - onlineUuids.size),
      highLoad,
      traffic,
      speed,
      total: totalCount
    };
  }, [live_data, nodeList]);

  if (isLoading) return <Loading />;
  if (error) return <div className="p-12 text-center font-black uppercase text-rose-400">Error_Access_Denied</div>;

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4 sm:px-0">
      
      {/* 1. 核心状态统计 - 只有一行 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimeStatCard 
          title="Nodes_Online" 
          value={stats.online} 
          subValue={`/ ${stats.total}`}
          icon={<Cpu size={18}/>} 
          color="#10b981" 
        />
        <AnimeStatCard 
          title="Nodes_Offline" 
          value={stats.offline} 
          icon={<CloudOff size={18}/>} 
          color={stats.offline > 0 ? "#f43f5e" : "#334155"} 
        />
        <AnimeStatCard 
          title="High_Load_Alert" 
          value={stats.highLoad} 
          icon={<AlertTriangle size={18}/>} 
          color={stats.highLoad > 0 ? "#fbbf24" : "#334155"} 
        />
        <AnimeStatCard 
          title="Realtime_Flow" 
          value={`${formatBytes(stats.speed)}/s`} 
          icon={<Zap size={18}/>} 
          color="#8b5cf6" 
        />
      </div>

      {/* 2. 辅助数据统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
         <div className="anime-card p-6 flex flex-col justify-center min-h-[120px] border border-white/5 bg-black/50 backdrop-blur-3xl shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
             <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 leading-none">System_Clock_Sync</span>
             <div className="text-3xl font-bold font-mono tracking-tighter text-white/90 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <CurrentTimeCard />
             </div>
          </div>
          <AnimeStatCard 
            title="Accumulated_Traffic" 
            value={formatBytes(stats.traffic)} 
            icon={<ArrowUpRight size={18}/>} 
            color="#ec4899" 
          />
      </div>

      {/* 3. 地图视角 */}
      {statusCardsVisibility.mapView && (
        <div className="anime-card overflow-hidden p-2 bg-black/60 border border-white/10 relative shadow-2xl rounded-[2rem]">
          <NodeMapView nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} mapOnly />
        </div>
      )}

      {/* 4. 舰队标题 */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-6">
        <div className="flex items-center gap-4">
          <div className="size-2.5 bg-purple-600 rounded-full shadow-[0_0_15px_#a855f7] animate-pulse" />
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white/95 leading-none">
            Control <span className="text-purple-500">Fleet</span>
          </h2>
        </div>

        <a 
          href="https://t.me/bedlate" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-purple-500/20 transition-all group shadow-2xl backdrop-blur-md"
        >
          <Send size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col leading-none gap-1.5">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Contact_Author</span>
            <span className="text-sm font-bold tracking-tight text-white/80 font-mono">@bedlate</span>
          </div>
        </a>
      </div>

      <AnimeDivider />

      <div className="relative min-h-[400px]">
        <Suspense fallback={<Loading />}>
          <NodeDisplay nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} />
        </Suspense>
      </div>
    </div>
  );
}