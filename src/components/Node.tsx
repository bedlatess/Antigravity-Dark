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
import { usePingStats } from "@/hooks/usePingStats";
import MiniPingChartFloat from "./MiniPingChartFloat";
import { Button } from "@/components/ui/button";

// --- 核心修复：补全并导出缺失的函数 ---

/**
 * 格式化在线时间，供 NodeTable 和 NodeCard 使用
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
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
      <div className="flex items-center gap-1.5 opacity-40 text-white">
        <Icon size={10}/>
        <span>{label}</span>
      </div>
      <span style={{ color }} className="font-mono font-bold">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <div
        className="h-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}88` }}
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
    <div className="anime-card group relative p-6 flex flex-col gap-6 bg-black/40 backdrop-blur-xl border-white/5 hover:border-purple-500/40 transition-all duration-500 rounded-[2rem]">
      <div className="flex items-start gap-5 relative z-10">
        <div className="w-14 h-14 bg-white/5 rounded-2xl p-3 border border-white/10 shrink-0">
          <img src={getOSImage(basic.os)} alt={basic.os} className="w-full h-full object-contain filter brightness-110" />
        </div>
        
        <div className="flex-1 min-w-0 pt-1">
          <Link href={`/instance/page?id=${basic.uuid}`} className="block mb-2">
            <h3 className="text-lg font-black tracking-tighter text-white hover:text-purple-400 transition-colors uppercase leading-none drop-shadow-md">
              {basic.name}
            </h3>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className={cn("text-[9px] px-2 border-none font-black uppercase", online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
              {online ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-[10px] font-mono font-bold opacity-20 text-white uppercase tracking-tighter">
              UP: {formatUptime(live?.uptime || 0, t)}
            </span>
          </div>
        </div>

        <MiniPingChartFloat uuid={basic.uuid} hours={24} trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 border border-white/5 text-white/20 hover:text-purple-400 rounded-xl transition-all">
            <TrendingUp size={16} />
          </Button>
        }/>
      </div>

      <div className="flex flex-col gap-5">
        <AnimeUsageBar label="CPU" value={live?.cpu?.usage || 0} color="#10b981" icon={Cpu} />
        <AnimeUsageBar label="RAM" value={memoryUsagePercent} color="#8b5cf6" icon={Server} />
        <AnimeUsageBar label="DISK" value={diskUsagePercent} color="#f59e0b" icon={HardDrive} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[10px]">
        <div className="flex flex-col">
          <span className="text-white/30 uppercase font-black mb-1">Upload</span>
          <span className="text-emerald-400 font-bold">{formatBytes(live?.network?.up || 0)}/s</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-white/30 uppercase font-black mb-1">Download</span>
          <span className="text-blue-400 font-bold">{formatBytes(live?.network?.down || 0)}/s</span>
        </div>
      </div>
    </div>
  );
};

// --- 网格容器组件 ---
export const NodeGrid = ({ nodes, liveData }: { nodes: NodeBasicInfo[]; liveData: LiveData }) => {
  const onlineNodes = liveData?.online || [];
  return (
    <div className="grid gap-6 py-2 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {nodes.map((node) => (
        <Node key={node.uuid} basic={node} live={liveData?.data?.[node.uuid]} online={onlineNodes.includes(node.uuid)} />
      ))}
    </div>
  );
};

export default Node;