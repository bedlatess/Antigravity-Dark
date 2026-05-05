"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Server, Activity, Shield, Globe, Cpu, HardDrive, Wifi, Terminal, Clock, Send } from "lucide-react";
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
  const nodeLive = (live_data?.data?.data || {})[uuid] as any;
  const nodeBasic = nodeList?.find((n) => n.uuid === uuid);

  if (listLoading) return <Loading />;
  if (!nodeBasic) return <div className="p-24 text-center font-black uppercase tracking-[0.5em] opacity-20">Link_Lost::Node_Null</div>;

  const extraInfo = nodeBasic as any;
  const memUsage = nodeBasic.mem_total ? Math.round((nodeLive?.ram?.used / nodeBasic.mem_total) * 100) : 0;
  const diskUsage = nodeBasic.disk_total ? Math.round((nodeLive?.disk?.used / nodeBasic.disk_total) * 100) : 0;

  // 统一样式变量：确保比例和谐
  const cardStyle = "anime-card bg-black/40 backdrop-blur-xl border-white/5 relative overflow-hidden transition-all duration-500 hover:border-white/10";
  const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 block";
  const valStyle = "text-4xl font-black font-mono tracking-tighter italic leading-none";

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 animate-in fade-in slide-in-from-top-6 duration-1000">
      
      {/* Header Area */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <Link href="/" className="anime-card p-3 hover:text-purple-400 hover:border-purple-500/40 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white/90">
              Unit <span className="text-purple-500">Terminal</span>
            </h1>
            <span className="text-[10px] font-bold opacity-30 tracking-[0.4em] uppercase font-mono">Status_Report_v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <a href="https://t.me/bedlate" target="_blank" className="text-[10px] font-black opacity-20 hover:opacity-100 hover:text-purple-400 transition-all uppercase tracking-widest">Help?</a>
           <Badge className={cn("px-6 py-1.5 border-none font-black tracking-widest text-[9px] italic shadow-lg", isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
             {isOnline ? "● CONNECTED" : "○ DISCONNECTED"}
           </Badge>
        </div>
      </div>

      {/* Hero Card */}
      <div className={cn(cardStyle, "p-10 lg:p-12")}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-purple-500/10 rounded-[2rem] flex items-center justify-center border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] group-hover:rotate-6 transition-transform duration-700">
              <Server size={44} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent uppercase italic">{nodeBasic.name}</h2>
              <div className="flex flex-wrap gap-4">
                {['region', 'virt', 'os'].map((key) => (
                  <div key={key} className="px-4 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
                    <div className="size-1 rounded-full bg-purple-500/50" />
                    <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{key}:</span>
                    <span className="text-[11px] font-bold font-mono text-white/80">{(nodeBasic as any)[key] || "GBL"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 p-8 bg-white/[0.02] rounded-3xl border border-white/5 min-w-[240px]">
             <span className={labelStyle}>Link_Uptime</span>
             <span className="font-mono text-3xl font-black text-purple-400 italic leading-none">{formatUptime(nodeLive?.uptime || 0, t)}</span>
          </div>
        </div>
        <Server className="absolute -right-20 -bottom-20 opacity-[0.03] rotate-12" size={400} />
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
        {[
          { label: "Core_Efficiency", value: `${nodeLive?.cpu?.usage || 0}%`, color: "text-emerald-400", sub: `Load: ${nodeLive?.cpu?.load?.toFixed(2) || "0.00"}`, icon: <Cpu /> },
          { label: "Memory_Allocation", value: `${memUsage}%`, color: "text-purple-400", sub: `${formatBytes(nodeLive?.ram?.used || 0)} OF ${formatBytes(nodeBasic.mem_total || 0)}`, icon: <Shield /> },
          { label: "Bandwidth_Flux", value: "ACTIVE", color: "text-cyan-400", sub: `UP: ${formatBytes(nodeLive?.network?.up || 0)}/s`, icon: <Wifi /> }
        ].map((item, i) => (
          <div key={i} className={cn(cardStyle, "p-8 group/item")}>
            <div className="flex justify-between items-center mb-6">
               <span className={labelStyle}>{item.label}</span>
               <div className="p-2 rounded-xl bg-white/5 text-white/20 group-hover/item:text-white transition-colors">{React.cloneElement(item.icon as any, { size: 14 })}</div>
            </div>
            <div className={cn(valStyle, item.color, "mb-3")}>{item.value}</div>
            <div className="text-[10px] font-bold font-mono opacity-30 uppercase tracking-widest">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Traffic Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className={cn(cardStyle, "p-8")}>
            <span className={labelStyle}>Cumulative_Data_Transfer</span>
            <div className="flex items-center justify-between gap-12 mt-4">
               <div className="flex-1">
                  <span className="text-[9px] font-black opacity-20 uppercase block mb-2">Matrix_Upload</span>
                  <div className="text-3xl font-mono font-black text-white/80">{formatBytes(nodeLive?.network?.totalUp || 0)}</div>
               </div>
               <div className="w-[1px] h-12 bg-white/10" />
               <div className="flex-1 text-right">
                  <span className="text-[9px] font-black opacity-20 uppercase block mb-2">Matrix_Download</span>
                  <div className="text-3xl font-mono font-black text-white/80">{formatBytes(nodeLive?.network?.totalDown || 0)}</div>
               </div>
            </div>
         </div>
         <div className={cn(cardStyle, "p-8")}>
            <div className="flex justify-between items-center mb-6">
              <span className={labelStyle}>Solid_State_Storage</span>
              <span className="text-xs font-mono font-black text-amber-500 italic uppercase">Sync: {diskUsage}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
               <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000" style={{ width: `${diskUsage}%` }} />
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">
               <span>{formatBytes(nodeLive?.disk?.used || 0)} USED</span>
               <span>{formatBytes(nodeBasic.disk_total || 0)} CAPACITY</span>
            </div>
         </div>
      </div>
    </div>
  );
}