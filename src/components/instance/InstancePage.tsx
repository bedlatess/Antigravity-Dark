"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Server, Activity, Shield } from "lucide-react";
import Link from "next/link";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";

export default function InstancePage({ uuid }: { uuid: string }) {
  const { t } = useTranslation();
  const { live_data } = useLiveData();
  const { nodeList, isLoading: listLoading } = useNodeList();

  const onlineList = live_data?.data?.online || [];
  const isOnline = onlineList.includes(uuid);
  const allNodeData = live_data?.data?.data || {};
  const nodeLive = allNodeData[uuid];
  const nodeBasic = nodeList?.find((n) => n.uuid === uuid);

  if (listLoading) return <Loading />;
  
  if (!nodeBasic) {
    return (
      <div className="anime-card p-12 text-center text-rose-400">
        NODE NOT FOUND
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <Link href="/" className="anime-card p-2 hover:text-purple-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Instance <span className="text-purple-500">Details</span></h1>
      </div>

      {/* 详情头部卡片 */}
      <div className="anime-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Server size={32} className="text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{nodeBasic.name}</h2>
              <Badge className={isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                {isOnline ? "LIVE" : "DOWN"}
              </Badge>
            </div>
            <p className="opacity-40 text-xs font-mono mt-1">{uuid}</p>
          </div>
        </div>
        
        <div className="flex gap-4 relative z-10">
           <div className="flex flex-col items-end">
              <span className="text-[10px] opacity-30 font-black uppercase">Region</span>
              <span className="font-bold text-purple-300">{nodeBasic.region || "Global"}</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] opacity-30 font-black uppercase">OS</span>
              <span className="font-bold">{nodeBasic.os}</span>
           </div>
        </div>
        <Server className="absolute -right-8 -bottom-8 opacity-[0.02] rotate-12" size={200} />
      </div>

      {/* 实时状态网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="anime-card p-5">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black opacity-30 uppercase tracking-widest">CPU Load</span>
              <Activity size={14} className="text-emerald-400" />
           </div>
           <div className="text-4xl font-black font-mono">{nodeLive?.cpu?.usage || 0}%</div>
        </div>
        
        <div className="anime-card p-5">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black opacity-30 uppercase tracking-widest">Memory</span>
              <Shield size={14} className="text-purple-400" />
           </div>
           <div className="text-4xl font-black font-mono">
              {nodeBasic.mem_total ? Math.round((nodeLive?.ram?.used / nodeBasic.mem_total) * 100) : 0}%
           </div>
        </div>

        <div className="anime-card p-5 flex flex-col justify-center text-center">
           <span className="text-[10px] opacity-30 font-black uppercase mb-2">Back to Dashboard</span>
           <Link href="/" className="text-purple-400 hover:underline font-bold tracking-tighter">RETURN_HOME</Link>
        </div>
      </div>

      <div className="anime-card p-12 text-center opacity-30 italic text-sm">
        Advanced charts and detailed logs will be synchronized in the next update.
      </div>
    </div>
  );
}