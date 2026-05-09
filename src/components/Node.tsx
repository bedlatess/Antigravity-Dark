"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TrendingUp, Cpu, Server, HardDrive } from "lucide-react";
import type { TFunction } from "i18next";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/utils/unitHelper";
import { cn } from "@/lib/utils";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { Record, LiveData } from "../types/LiveData";
import { getOSImage } from "@/utils";
import MiniPingChartFloat from "./MiniPingChartFloat";
import { Button } from "@/components/ui/button";

// --- 核心工具导出 ---

/**
 * 格式化在线时间（完全正体优化）
 */
export function formatUptime(seconds: number, t: TFunction): string {
  if (!seconds || seconds < 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

export function getTrafficUsed(totalUp: number, totalDown: number, type: "max" | "min" | "sum" | "up" | "down") {
  switch (type) {
    case "max": return Math.max(totalUp, totalDown);
    case "min": return Math.min(totalUp, totalDown);
    case "sum": return totalUp + totalDown;
    case "up": return totalUp;
    case "down": return totalDown;
    default: return 0;
  }
}

// --- 极简正体进度条组件 ---
const AnimeUsageBar = ({ label, value, color, icon: Icon }: any) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
      <div className="flex items-center gap-2 opacity-30 text-white">
        <Icon size={11}/>
        <span>{label}</span>
      </div>
      <span style={{ color }} className="font-mono font-black">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <div
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}66` }}
      />
    </div>
  </div>
);

// --- 单个节点卡片组件 ---
const Node = ({ basic, live, online }: { basic: NodeBasicInfo; live: Record | undefined; online: boolean }) => {
  const { t } = useTranslation();
  const memoryUsagePercent = basic.mem_total ? ((live?.ram?.used || 0) / basic.mem_total) * 100 : 0;
  const diskUsagePercent = basic.disk_total ? ((live?.disk?.used || 0) / basic.disk_total) * 100 : 0;

  return (
    <div className="anime-card group relative p-7 flex flex-col gap-8 bg-black/40 backdrop-blur-2xl border border-white/5 hover:border-purple-500/40 transition-all duration-700 rounded-[2.5rem] overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 size-40 bg-purple-500/5 blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-1000" />
      
      <div className="flex items-start gap-6 relative z-10">
        <div className="w-16 h-16 bg-white/5 rounded-2xl p-3.5 border border-white/10 shrink-0 shadow-inner flex items-center justify-center">
          <img src={getOSImage(basic.os)} alt={basic.os} className="w-full h-full object-contain filter brightness-125" />
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <Link href={`/instance/page?id=${basic.uuid}`} className="block mb-2">
            <h3 className="text-xl font-black tracking-tighter text-white/90 hover:text-purple-400 transition-colors uppercase leading-none truncate">
              {basic.name}
            </h3>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className={cn("text-[9px] px-2.5 py-0.5 border-none font-black uppercase tracking-widest", 
              online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
              {online ? "Stable" : "Lost"}
            </Badge>
            <span className="text-[9px] font-mono font-bold opacity-20 text-white uppercase tracking-tighter">
              UP_{formatUptime(live?.uptime || 0, t)}
            </span>
          </div>
        </div>

        <MiniPingChartFloat uuid={basic.uuid} hours={24} trigger={
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5 border border-white/5 text-white/20 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all">
            <TrendingUp size={18} />
          </Button>
        }/>
      </div>

      <div className="flex flex-col gap-6">
        <AnimeUsageBar label="Processor" value={live?.cpu?.usage || 0} color="#10b981" icon={Cpu} />
        <AnimeUsageBar label="Memory" value={memoryUsagePercent} color="#8b5cf6" icon={Server} />
        <AnimeUsageBar label="Storage" value={diskUsagePercent} color="#f59e0b" icon={HardDrive} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 p-5 bg-white/[0.02] rounded-2xl border border-white/5 font-mono">
        <div className="flex flex-col gap-1">
          <span className="text-white/20 uppercase font-black text-[9px] tracking-widest">Inbound</span>
          <span className="text-emerald-400 font-bold text-sm tracking-tighter">{formatBytes(live?.network?.up || 0)}/s</span>
        </div>
        <div className="flex flex-col gap-1 text-right border-l border-white/5">
          <span className="text-white/20 uppercase font-black text-[9px] tracking-widest">Outbound</span>
          <span className="text-blue-400 font-bold text-sm tracking-tighter">{formatBytes(live?.network?.down || 0)}/s</span>
        </div>
      </div>
    </div>
  );
};

// --- 网格容器组件 ---
export const NodeGrid = ({ nodes, liveData }: { nodes: NodeBasicInfo[]; liveData: LiveData }) => {
  const onlineNodes = liveData?.online || [];
  return (
    <div className="grid gap-8 py-2 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {nodes.map((node) => (
        <Node key={node.uuid} basic={node} live={liveData?.data?.[node.uuid]} online={onlineNodes.includes(node.uuid)} />
      ))}
    </div>
  );
};

export default Node;