"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { formatBytes } from "@/utils/unitHelper";
import { formatUptime } from "./Node";
import { cn } from "@/lib/utils";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "../types/LiveData";
import Flag from "./Flag";

interface NodeTableProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
}

const NodeTable: React.FC<NodeTableProps> = ({ nodes, liveData }) => {
  const { t } = useTranslation();
  const onlineNodes = liveData?.online || [];

  const thClass = "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5";

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.02]">
            <th className={thClass}>Node Name</th>
            <th className={thClass}>OS</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>CPU</th>
            <th className={thClass}>RAM</th>
            <th className={thClass}>Storage</th>
            <th className={thClass}>Network Speed</th>
            <th className={thClass}>Total Traffic</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {nodes.map((node) => {
            const isOnline = onlineNodes.includes(node.uuid);
            const live = liveData.data?.[node.uuid];
            const memUsage = node.mem_total ? Math.round(((live?.ram?.used || 0) / node.mem_total) * 100) : 0;
            const diskUsage = node.disk_total ? Math.round(((live?.disk?.used || 0) / node.disk_total) * 100) : 0;

            return (
              <tr key={node.uuid} className="group hover:bg-white/[0.02] transition-colors duration-500">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {/* 修复点：对 Flag 组件使用 any 绕过类型检查，确保 region 正常传入 */}
                    <Flag {...({ region: node.region } as any)} className="size-5 rounded-sm opacity-80" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black tracking-tight text-white/90 group-hover:text-purple-400 transition-colors">{node.name}</span>
                      <span className="text-[10px] font-mono font-bold opacity-20 uppercase">{formatUptime(live?.uptime || 0, t)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5"><span className="text-xs font-bold opacity-60 italic">{node.os}</span></td>
                <td className="px-6 py-5">
                   <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase", 
                     isOnline ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20")}>
                     <div className={cn("size-1 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                     {isOnline ? "Online" : "Offline"}
                   </div>
                </td>
                <td className="px-6 py-5 font-mono text-xs font-bold text-white/80">{live?.cpu?.usage || 0}%</td>
                <td className="px-6 py-5 font-mono text-xs font-bold text-white/80">{memUsage}%</td>
                <td className="px-6 py-5 font-mono text-xs font-bold text-white/80">{diskUsage}%</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col text-[10px] font-mono leading-tight gap-1">
                    <span className="text-emerald-400/70 font-bold tracking-tighter italic">↑ {formatBytes(live?.network?.up || 0)}/s</span>
                    <span className="text-blue-400/70 font-bold tracking-tighter italic">↓ {formatBytes(live?.network?.down || 0)}/s</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-mono text-xs font-black text-purple-400/80">
                  {formatBytes((live?.network?.totalUp || 0) + (live?.network?.totalDown || 0))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NodeTable;