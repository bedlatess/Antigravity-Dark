"use client";

import React, { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Activity, ArrowUpRight, Zap, Box, Send, ShieldCheck } from "lucide-react";

import NodeDisplay from "@/components/NodeDisplay";
import { formatBytes } from "@/utils/unitHelper";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import Loading from "@/components/loading";
import { CurrentTimeCard } from "@/components/CurrentTimeCard";
import { NodeMapView } from "@/components/NodeMapView";
import { useStatusCardsVisibility } from "@/hooks/useStatusCardsVisibility";

// --- 极简二次元风格统计卡片 ---
const AnimeStatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="anime-card p-5 flex flex-col gap-4 group/card relative overflow-hidden min-h-[110px] bg-black/40 border-white/5 hover:border-white/20 transition-all duration-500 backdrop-blur-xl">
    <div className="flex justify-between items-center relative z-10">
      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{title}</span>
      <div className="p-2 rounded-xl bg-white/5 text-white/40 group-hover/card:text-white group-hover/card:bg-white/10 transition-all duration-500 shadow-inner">
        {Icon}
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-black tracking-tighter font-mono italic" style={{ color: color, textShadow: `0 0 20px ${color}44` }}>
        {value}
      </div>
    </div>
    {/* 背景水印装饰 */}
    <div className="absolute -right-4 -bottom-6 opacity-[0.02] italic font-black text-7xl pointer-events-none select-none group-hover/card:opacity-[0.05] group-hover/card:scale-110 transition-all duration-1000">
      CORE
    </div>
  </div>
);

// --- 极简分割线装饰 ---
const AnimeDivider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7] animate-pulse" />
    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
  </div>
);

export default function DashboardContent() {
  const { t } = useTranslation();
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

  if (isLoading) return <Loading />;
  if (error) return <div className="text-rose-400 p-8 text-center anime-card border-rose-500/20 bg-rose-500/5">ACCESS_DENIED:: {error}</div>;

  const data = live_data?.data?.data;
  const onlineSet = new Set(live_data?.data?.online || []);
  const activeNodes = Object.entries(data || {}).filter(([uuid]) => onlineSet.has(uuid)).map(([, n]) => n);

  const totalUp = activeNodes.reduce((acc, n) => acc + (n.network.totalUp || 0), 0);
  const totalDown = activeNodes.reduce((acc, n) => acc + (n.network.totalDown || 0), 0);
  const speedDown = activeNodes.reduce((acc, n) => acc + (n.network.down || 0), 0);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-1000 px-2 sm:px-0">
      
      {/* 1. 顶部统计区域 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCardsVisibility.currentTime && (
          <div className="anime-card p-5 flex flex-col justify-center min-h-[110px] border-white/5 bg-black/40 backdrop-blur-xl">
             <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-3">Local_Time_Link</span>
             <CurrentTimeCard />
          </div>
        )}
        {statusCardsVisibility.currentOnline && (
          <AnimeStatCard title="Active_Probes" value={`${onlineSet.size} / ${nodeList?.length || 0}`} icon={<Activity size={16}/>} color="#34d399" />
        )}
        {statusCardsVisibility.trafficOverview && (
          <AnimeStatCard title="Accumulated_Traffic" value={formatBytes(totalUp + totalDown)} icon={<ArrowUpRight size={16}/>} color="#a855f7" />
        )}
        {statusCardsVisibility.networkSpeed && (
          <AnimeStatCard title="Throughput_Realtime" value={`${formatBytes(speedDown)}/s`} icon={<Zap size={16}/>} color="#fbbf24" />
        )}
      </div>

      {/* 2. 地图视角 - 增加呼吸边框 */}
      {statusCardsVisibility.mapView && (
        <div className="anime-card overflow-hidden p-1 bg-black/40 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <NodeMapView nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} mapOnly />
        </div>
      )}

      {/* 3. 舰队标题栏 - 整合 TG 联系方式 */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-6">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <Box className="size-6 text-purple-500 shadow-[0_0_10px_#a855f744]" />
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white/90">
              PROBE <span className="text-purple-500">FLEET</span>
            </h2>
          </div>
          <p className="text-[10px] font-black text-white/10 tracking-[0.4em] pl-10 uppercase">System_Core_Matrix_Stable</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* TG 联系按钮 */}
          <a 
            href="https://t.me/bedlate" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#24A1DE]/10 hover:border-[#24A1DE]/50 transition-all group shadow-xl backdrop-blur-md"
          >
            <Send size={14} className="text-[#24A1DE] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="flex flex-col leading-none gap-1">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">Contact_Author</span>
              <span className="text-xs font-bold tracking-tighter text-white/90">TG: @bedlate</span>
            </div>
          </a>

          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Global_Link_Active</span>
          </div>
        </div>
      </div>

      <AnimeDivider />

      {/* 4. 节点展示区域 */}
      <Suspense fallback={
        <div className="py-32 text-center">
          <div className="inline-block size-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
          <div className="opacity-30 uppercase tracking-[0.5em] text-[10px] font-black animate-pulse">Decrypting_Matrix_Stream...</div>
        </div>
      }>
        <NodeDisplay nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} />
      </Suspense>
    </div>
  );
}