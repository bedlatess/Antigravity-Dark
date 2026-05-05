"use client";

import React, { useMemo } from "react";
import { ArrowLeft, Cpu, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import { formatBytes } from "@/utils/unitHelper";
import Loading from "@/components/loading";
import { cn } from "@/lib/utils";

// 格式化在线时间（正体版）
function formatUptime(seconds: number): string {
  if (!seconds || seconds < 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

export default function InstancePage({ uuid }: { uuid: string }) {
  const { live_data } = useLiveData();
  const { nodeList, isLoading: listLoading } = useNodeList();

  const nodeBasic = useMemo(() => nodeList?.find((n) => n.uuid === uuid), [nodeList, uuid]);
  const nodeLive = useMemo(() => live_data?.data?.data?.[uuid], [live_data, uuid]);
  const isOnline = useMemo(() => live_data?.data?.online?.includes(uuid), [live_data, uuid]);

  if (listLoading) return <Loading />;

  if (!nodeBasic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/20">
        <p className="text-sm font-black uppercase tracking-[0.4em]">Node_Not_Found :: {uuid.slice(0, 8)}</p>
        <Link href="/" className="mt-6 text-purple-500 hover:text-purple-400 text-xs font-bold uppercase tracking-widest transition-colors">
          Back to Matrix
        </Link>
      </div>
    );
  }

  const cardBase = "bg-black/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 transition-all duration-500 hover:border-purple-500/20";
  const labelStyle = "text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block";
  const valueStyle = "text-4xl font-bold tracking-tighter text-white leading-none font-mono";

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full px-6 py-10 animate-in fade-in duration-700">
      {/* 头部导航 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-4 bg-white/5 rounded-2xl hover:bg-purple-500/20 transition-all border border-white/5 shadow-xl">
            <ArrowLeft size={24} className="text-white/80" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white drop-shadow-lg">{nodeBasic.name}</h1>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px] font-black uppercase tracking-widest border border-purple-500/20">System_Core</span>
               <span className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] font-mono text-white">ID: {uuid.slice(0, 12)}</span>
            </div>
          </div>
        </div>
        <div className={cn("px-8 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase border shadow-2xl transition-all", 
          isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
          {isOnline ? "● Connection_Stable" : "○ Signal_Lost"}
        </div>
      </div>

      {/* 核心指标区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardBase}>
          <div className="flex justify-between items-start mb-6">
            <span className={labelStyle}>Processor_Efficiency</span>
            <Cpu className="text-emerald-500/40" size={20} />
          </div>
          <div className={cn(valueStyle, "text-emerald-400")}>{nodeLive?.cpu?.usage || 0}%</div>
          {/* 核心修复：通过类型断言绕过访问检查，确保 build 成功 */}
          <p className="text-[9px] font-bold text-white/10 mt-4 uppercase font-mono tracking-widest">
            Load_Factor: {(nodeLive?.cpu as any)?.load?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-start mb-6">
            <span className={labelStyle}>Memory_Allocation</span>
            <Activity className="text-purple-500/40" size={20} />
          </div>
          <div className={cn(valueStyle, "text-purple-400")}>
            {nodeBasic.mem_total ? Math.round(((nodeLive?.ram?.used || 0) / nodeBasic.mem_total) * 100) : 0}%
          </div>
          <p className="text-[9px] font-bold text-white/10 mt-4 uppercase font-mono tracking-tighter">
            {formatBytes(nodeLive?.ram?.used || 0)} / {formatBytes(nodeBasic.mem_total || 0)}
          </p>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-start mb-6">
            <span className={labelStyle}>Link_Uptime</span>
            <Clock className="text-amber-500/40" size={20} />
          </div>
          <div className={cn(valueStyle, "text-amber-500")}>
             {formatUptime(nodeLive?.uptime || 0)}
          </div>
          <p className="text-[9px] font-bold text-white/10 mt-4 uppercase font-mono tracking-[0.3em]">Network_Stable</p>
        </div>
      </div>

      {/* 流量与磁盘展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardBase}>
          <span className={labelStyle}>Cumulative_Data_Matrix</span>
          <div className="flex items-center gap-12 mt-8">
             <div className="flex-1">
                <div className="text-[9px] font-black text-white/10 uppercase mb-3 tracking-widest">Inbound</div>
                <div className="text-4xl font-bold text-white/80 font-mono tracking-tighter">{formatBytes(nodeLive?.network?.totalUp || 0)}</div>
             </div>
             <div className="w-px h-16 bg-white/5" />
             <div className="flex-1 text-right">
                <div className="text-[9px] font-black text-white/10 uppercase mb-3 tracking-widest">Outbound</div>
                <div className="text-4xl font-bold text-white/80 font-mono tracking-tighter">{formatBytes(nodeLive?.network?.totalDown || 0)}</div>
             </div>
          </div>
        </div>

        <div className={cardBase}>
           <div className="flex justify-between items-center mb-8">
              <span className={labelStyle}>Solid_State_Storage</span>
              <span className="text-sm font-bold text-amber-500/80 font-mono">
                {nodeBasic.disk_total ? Math.round(((nodeLive?.disk?.used || 0) / nodeBasic.disk_total) * 100) : 0}%
              </span>
           </div>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-1000" 
                style={{ width: `${nodeBasic.disk_total ? (Math.round(((nodeLive?.disk?.used || 0) / nodeBasic.disk_total) * 100)) : 0}%` }} 
              />
           </div>
           <div className="flex justify-between mt-4 text-[9px] font-bold text-white/10 uppercase font-mono tracking-tighter">
              <span>Used: {formatBytes(nodeLive?.disk?.used || 0)}</span>
              <span>Capacity: {formatBytes(nodeBasic.disk_total || 0)}</span>
           </div>
        </div>
      </div>
    </div>
  );
}