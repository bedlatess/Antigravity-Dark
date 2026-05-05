"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TrendingUp, Activity } from "lucide-react";
import type { TFunction } from "i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData, Record } from "../types/LiveData";
import { getOSImage } from "@/utils";
import { formatBytes } from "@/utils/unitHelper";
import { usePingStats } from "@/hooks/usePingStats";
import MiniPingChartFloat from "./MiniPingChartFloat";
import { cn } from "@/lib/utils";

// --- 补全导出函数（修复 NodeTable.tsx 的依赖报错） ---

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

export function getTrafficPercentage(totalUp: number, totalDown: number, limit: number, type: "max" | "min" | "sum" | "up" | "down") {
  if (limit === 0) return 0;
  const used = getTrafficUsed(totalUp, totalDown, type);
  return (used / limit) * 100;
}

export function formatTrafficPercentage(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  return `${value.toFixed(1)}%`;
}

// --- 极简二次元进度条组件 ---
const AnimeUsageBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col gap-1.5 w-full group/bar">
    <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-black">
      <span className="text-white/20 group-hover/bar:text-white/50 transition-colors">{label}</span>
      <span style={{ color }} className="font-mono">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
      <div
        className="h-full transition-all duration-1000 ease-out rounded-full relative z-10"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}aa` }}
      />
    </div>
  </div>
);

// --- 单个节点组件 ---
const Node = ({ basic, live, online }: { basic: NodeBasicInfo; live: Record | undefined; online: boolean }) => {
  const { t } = useTranslation();
  const pingStats = usePingStats(basic.uuid, 24);
  const liveData = live || ({ cpu: { usage: 0 }, ram: { used: 0 }, disk: { used: 0 }, network: { up: 0, down: 0, totalUp: 0, totalDown: 0 }, uptime: 0 } as Record);

  const memoryUsagePercent = basic.mem_total ? (liveData.ram.used / basic.mem_total) * 100 : 0;
  const diskUsagePercent = basic.disk_total ? (liveData.disk.used / basic.disk_total) * 100 : 0;

  return (
    <div className="anime-card group relative p-5 flex flex-col gap-6 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/30 transition-all duration-500">
      <div className="absolute -right-2 -top-2 text-8xl font-black opacity-[0.02] italic pointer-events-none select-none uppercase">
        {basic.name.slice(0, 3)}
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-white/5 rounded-2xl p-2.5 border border-white/10 group-hover:rotate-[10deg] transition-all duration-500">
          <img src={getOSImage(basic.os)} alt={basic.os} className="w-full h-full object-contain filter brightness-125" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Link href={`/instance/page?id=${basic.uuid}`} className="hover:text-purple-400 transition-colors truncate block">
              <h3 className="text-base font-black tracking-tighter text-white/90">{basic.name}</h3>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
            <span className="text-white/20 uppercase">UP:</span>
            <span className="text-white/60">{formatUptime(liveData.uptime, t)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge className={cn("text-[9px] px-2 h-5 border-none font-black", online ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]' : 'bg-rose-500/10 text-rose-400')}>
            {online ? "● ONLINE" : "○ OFFLINE"}
          </Badge>
          <MiniPingChartFloat uuid={basic.uuid} hours={24} trigger={
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-purple-400"><TrendingUp size={14} /></Button>
          }/>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AnimeUsageBar label="Processor" value={liveData.cpu.usage} color="#34d399" />
        <AnimeUsageBar label="Memory" value={memoryUsagePercent} color="#a855f7" />
        <AnimeUsageBar label="Storage" value={diskUsagePercent} color="#fbbf24" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1 pt-4 border-t border-white/5 font-mono text-[10px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-emerald-400/60 uppercase tracking-tighter font-black">↑ Upload</span>
          <span className="text-xs font-bold text-slate-300 italic">{formatBytes(liveData.network.up)}/s</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-blue-400/60 uppercase tracking-tighter font-black">↓ Download</span>
          <span className="text-xs font-bold text-slate-300 italic">{formatBytes(liveData.network.down)}/s</span>
        </div>
      </div>
    </div>
  );
};

// --- 网格容器组件 ---
export const NodeGrid = ({ nodes, liveData }: { nodes: NodeBasicInfo[]; liveData: LiveData }) => {
  const onlineNodes = liveData?.online || [];
  const sortedNodes = [...nodes].sort((a, b) => {
    const aOnline = onlineNodes.includes(a.uuid);
    const bOnline = onlineNodes.includes(b.uuid);
    return aOnline !== bOnline ? (aOnline ? -1 : 1) : a.weight - b.weight;
  });

  return (
    <div className="grid gap-6 py-4 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
      {sortedNodes.map((node) => (
        <Node key={node.uuid} basic={node} live={liveData?.data?.[node.uuid]} online={onlineNodes.includes(node.uuid)} />
      ))}
    </div>
  );
};

export default Node;