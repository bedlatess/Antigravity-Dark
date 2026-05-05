"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Server, Activity, Shield, Globe, Cpu, HardDrive, Clock, Wifi, Terminal } from "lucide-react";
import Link from "next/link";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/utils/unitHelper";
import { formatUptime } from "@/components/Node";
import { cn } from "@/lib/utils";

export default function InstancePage({ uuid }: { uuid: string }) {
  const { t } = useTranslation();
  const { live_data } = useLiveData();
  const { nodeList, isLoading: listLoading } = useNodeList();

  const onlineList = live_data?.data?.online || [];
  const isOnline = onlineList.includes(uuid);
  const allNodeData = live_data?.data?.data || {};
  const nodeLive = allNodeData[uuid] as any;
  const nodeBasic = nodeList?.find((n) => n.uuid === uuid);

  if (listLoading) return <Loading />;
  if (!nodeBasic) return <div className="p-12 text-center text-rose-400 anime-card">NODE NOT FOUND</div>;

  const extraInfo = nodeBasic as any;
  const cpuUsage = nodeLive?.cpu?.usage || 0;
  const memUsage = nodeBasic.mem_total ? Math.round((nodeLive?.ram?.used / nodeBasic.mem_total) * 100) : 0;
  const diskUsage = nodeBasic.disk_total ? Math.round((nodeLive?.disk?.used / nodeBasic.disk_total) * 100) : 0;

  // 样式定义提取，防止引号断裂
  const labelClass = "text-[10px] opacity-20 font-black uppercase tracking-widest";
  const cardClass = "anime-card p-6 flex flex-col gap-4";
  const valueClass = "text-2xl font-black font-mono text-white/80";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-1000">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="anime-card p-2.5 hover:text-purple-400 transition-all"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-black italic uppercase">Instance <span className="text-purple-500">Details</span></h1>
        </div>
        <Badge className={cn("px-4 py-1 border-none font-black", isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
          {isOnline ? "● LIVE" : "○ DOWN"}
        </Badge>
      </div>

      {/* 2. Main Info */}
      <div className="anime-card p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative overflow-hidden bg-black/40">
        <div className="lg:col-span-2 flex items-start gap-8 relative z-10">
          <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20"><Server size={40} className="text-purple-400" /></div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">{nodeBasic.name}</h2>
            <div className="flex flex-wrap gap-3 text-[10px] font-mono">
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">REGION: {nodeBasic.region || "GBL"}</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">VIRT: {extraInfo.virt || "KVM"}</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">OS: {nodeBasic.os}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/5 relative z-10">
          <div className="flex justify-between items-center text-[10px] font-black opacity-30 uppercase mb-2">Uptime</div>
          <div className="font-mono text-purple-400 font-bold">{formatUptime(nodeLive?.uptime || 0, t)}</div>
        </div>
      </div>

      {/* 3. Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs font-black opacity-40 uppercase"><span>CPU Load</span><Cpu size={14} /></div>
          <div className="text-3xl font-black font-mono text-emerald-400">{cpuUsage.toFixed(1)}%</div>
          <div className="text-[10px] opacity-20 uppercase font-black">Cores: {extraInfo.cpu_count || 1}</div>
        </div>
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs font-black opacity-40 uppercase"><span>Memory</span><Activity size={14} /></div>
          <div className="text-3xl font-black font-mono text-purple-400">{memUsage}%</div>
          <div className="text-[10px] opacity-20 uppercase font-black">{formatBytes(nodeLive?.ram?.used || 0)} / {formatBytes(nodeBasic.mem_total || 0)}</div>
        </div>
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs font-black opacity-40 uppercase"><span>Bandwidth</span><Wifi size={14} /></div>
          <div className="font-mono text-[10px] text-cyan-400 font-bold">UP: {formatBytes(nodeLive?.network?.up || 0)}/s</div>
          <div className="font-mono text-[10px] text-blue-400 font-bold">DOWN: {formatBytes(nodeLive?.network?.down || 0)}/s</div>
        </div>
      </div>

      {/* 4. Traffic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2"><Globe size={14} className="text-blue-400" /><span className="text-xs font-black opacity-40 uppercase">Traffic</span></div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className={labelClass}>Sent</div><div className={valueClass}>{formatBytes(nodeLive?.network?.totalUp || 0)}</div></div>
            <div><div className={labelClass}>Received</div><div className={valueClass}>{formatBytes(nodeLive?.network?.totalDown || 0)}</div></div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2"><HardDrive size={14} className="text-amber-400" /><span className="text-xs font-black opacity-40 uppercase">Storage</span></div>
          <div className="text-2xl font-black font-mono text-amber-400">{diskUsage}%</div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-amber-500/50" style={{ width: `${diskUsage}%` }} /></div>
        </div>
      </div>

      <div className="flex justify-center py-8">
        <Link href="/" className="px-8 py-3 anime-card opacity-40 hover:opacity-100 transition-all text-[10px] font-black uppercase tracking-[0.5em]">
          Return Gateway
        </Link>
      </div>
    </div>
  );
}