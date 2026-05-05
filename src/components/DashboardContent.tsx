"use client";

import React, { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Activity, ArrowUpRight, Zap, Box } from "lucide-react";

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
  <div className="anime-card p-4 flex flex-col gap-3 group/card relative overflow-hidden min-h-[100px] border-white/5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-center relative z-10">
      <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{title}</span>
      <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover/card:text-white transition-colors duration-500">
        {Icon}
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-2xl font-black tracking-tighter font-mono" style={{ color: color }}>
        {value}
      </div>
    </div>
    <div className="absolute -right-2 -bottom-4 opacity-[0.03] italic font-black text-6xl pointer-events-none select-none group-hover/card:opacity-[0.06] transition-opacity duration-700">
      STATUS
    </div>
  </div>
);

// --- 极简分割线装饰 ---
const AnimeDivider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_12px_#a855f7]" />
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
  if (error) return <div className="text-rose-400 p-8 text-center anime-card border-rose-500/20 bg-rose-500/5">Error: {error}</div>;

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
          <div className="anime-card p-4 flex flex-col justify-center min-h-[100px] border-white/5">
             <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">{t("current_time")}</span>
             <CurrentTimeCard />
          </div>
        )}
        {statusCardsVisibility.currentOnline && (
          <AnimeStatCard title={t("current_online")} value={`${onlineSet.size} / ${nodeList?.length || 0}`} icon={<Activity size={14}/>} color="#34d399" />
        )}
        {statusCardsVisibility.trafficOverview && (
          <AnimeStatCard title="Accumulated Data" value={formatBytes(totalUp + totalDown)} icon={<ArrowUpRight size={14}/>} color="#a855f7" />
        )}
        {statusCardsVisibility.networkSpeed && (
          <AnimeStatCard title="Realtime Throughput" value={`${formatBytes(speedDown)}/s`} icon={<Zap size={14}/>} color="#fbbf24" />
        )}
      </div>

      {/* 2. 地图视角 */}
      {statusCardsVisibility.mapView && (
        <div className="anime-card overflow-hidden p-1 bg-black/40 border border-white/5">
          <NodeMapView nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} mapOnly />
        </div>
      )}

      {/* 3. 舰队标题栏 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Box className="size-5 text-purple-500" />
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-white/90">
              PROBE <span className="text-purple-500">FLEET</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] pl-8">SYSTEM_CORE_MATRIX_v1.2</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Global Link Active</span>
        </div>
      </div>

      <AnimeDivider />

      {/* 4. 节点展示区域 */}
      <Suspense fallback={<div className="py-24 text-center opacity-50 uppercase tracking-[0.3em] text-[10px] font-black">Decrypting Matrix...</div>}>
        <NodeDisplay nodes={nodeList ?? []} liveData={live_data?.data ?? { online: [], data: {} }} />
      </Suspense>
    </div>
  );
}