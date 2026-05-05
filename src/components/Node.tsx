"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import type { TFunction } from "i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData, Record } from "../types/LiveData";
import { getOSImage } from "@/utils";
import { formatBytes } from "@/utils/unitHelper";
import { usePingStats } from "@/hooks/usePingStats";

import MiniPingChartFloat from "./MiniPingChartFloat";
import Tips from "./ui/tips";

// --- 导出供 NodeTable 使用的辅助函数 ---
export function formatUptime(seconds: number, t: TFunction): string {
  if (!seconds || seconds < 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getTrafficPercentage(totalUp: number, totalDown: number, limit: number, type: "max" | "min" | "sum" | "up" | "down") {
  if (limit === 0) return 0;
  const used = getTrafficUsed(totalUp, totalDown, type);
  return (used / limit) * 100;
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

export function formatTrafficPercentage(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  return `${value.toFixed(1)}%`;
}

// --- 极简进度条组件 ---
const AnimeUsageBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col gap-1.5 w-full group/bar">
    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
      <span className="text-slate-400 group-hover/bar:text-slate-200 transition-colors">{label}</span>
      <span style={{ color: color }} className="font-mono">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
      <div
        className="h-full transition-all duration-1000 ease-out rounded-full"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}88`,
        }}
      />
    </div>
  </div>
);

const Node = ({ basic, live, online }: { basic: NodeBasicInfo; live: Record | undefined; online: boolean }) => {
  const { t } = useTranslation();
  const pingStats = usePingStats(basic.uuid, 24);

  const liveData = live || ({
    cpu: { usage: 0 },
    ram: { used: 0 },
    disk: { used: 0 },
    network: { up: 0, down: 0, totalUp: 0, totalDown: 0 },
    uptime: 0,
  } as Record);

  const memoryUsagePercent = basic.mem_total ? (liveData.ram.used / basic.mem_total) * 100 : 0;
  const diskUsagePercent = basic.disk_total ? (liveData.disk.used / basic.disk_total) * 100 : 0;

  return (
    <div className="anime-card group relative p-5 flex flex-col gap-5 overflow-hidden">
      <div className="absolute -right-4 -top-4 text-7xl font-black opacity-[0.03] italic pointer-events-none select-none uppercase">
        {basic.name.slice(0, 2)}
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-xl p-2.5 border border-white/10 group-hover:border-purple-500/50 transition-all duration-500">
          <img src={getOSImage(basic.os)} alt={basic.os} className="w-full h-full object-contain filter drop-shadow(0 0 5px rgba(255,255,255,0.2))" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/instance/${basic.uuid}`} className="hover:text-purple-400 transition-colors truncate text-white">
              <h3 className="text-base font-bold tracking-tight">{basic.name}</h3>
            </Link>
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-mono">
              {basic.region || "GBL"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] opacity-40 font-mono italic">
            <span>UP: {formatUptime(liveData.uptime, t)}</span>
            <span>•</span>
            <span>{pingStats.hasData ? `${Math.round(pingStats.avgLatency)}ms` : "N/A"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={`text-[10px] px-2 py-0 h-5 border-none ${online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {online ? "ONLINE" : "OFFLINE"}
          </Badge>
          <MiniPingChartFloat
            uuid={basic.uuid}
            hours={24}
            trigger={
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-40 hover:opacity-100 hover:text-purple-400 transition-all">
                <TrendingUp size={14} />
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <AnimeUsageBar label="Processor" value={liveData.cpu.usage} color="#34d399" />
        <AnimeUsageBar label="Memory" value={memoryUsagePercent} color="#a855f7" />
        <AnimeUsageBar label="Storage" value={diskUsagePercent} color="#f59e0b" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-1 pt-4 border-t border-white/5 font-mono text-[10px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-emerald-400/60 uppercase">↑ Up</span>
          <span className="text-xs font-bold text-slate-300">{formatBytes(liveData.network.up)}/s</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-blue-400/60 uppercase">↓ Down</span>
          <span className="text-xs font-bold text-slate-300">{formatBytes(liveData.network.down)}/s</span>
        </div>
      </div>
    </div>
  );
};

export const NodeGrid = ({ nodes, liveData }: { nodes: NodeBasicInfo[]; liveData: LiveData }) => {
  const onlineNodes = liveData?.online || [];
  const sortedNodes = [...nodes].sort((a, b) => {
    const aOnline = onlineNodes.includes(a.uuid);
    const bOnline = onlineNodes.includes(b.uuid);
    if (aOnline !== bOnline) return aOnline ? -1 : 1;
    return a.weight - b.weight;
  });

  return (
    <div className="grid gap-5 py-6 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {sortedNodes.map((node) => (
        <Node key={node.uuid} basic={node} live={liveData?.data?.[node.uuid]} online={onlineNodes.includes(node.uuid)} />
      ))}
    </div>
  );
};

export default Node;