"use client";

import React, { useMemo } from "react";
import { useNodeDetails } from "@/contexts/NodeDetailsContext";
import { useTranslation } from "react-i18next";
import { Loader2, AlertCircle } from "lucide-react";
import Selector from "./Selector";
import { cn } from "@/lib/utils";

interface NodeSelectorProps {
  className?: string;
  hiddenDescription?: boolean;
  value: string[]; // uuid 列表
  onChange: (uuids: string[]) => void;
  hiddenUuidOnlyClient?: boolean;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({
  className = "",
  hiddenDescription = false,
  value,
  onChange,
  hiddenUuidOnlyClient = false,
}) => {
  const { nodeDetail, isLoading, error } = useNodeDetails();
  const { t } = useTranslation();

  // 优化过滤逻辑：使用 useMemo 提高性能并确保数据纯净
  const nodesFiltered = useMemo(() => {
    let currentValues = value;
    if (hiddenUuidOnlyClient && nodeDetail) {
      return currentValues.filter((uuid) =>
        nodeDetail.find((n) => n.uuid === uuid && !n.is_only_client)
      );
    }
    return currentValues;
  }, [value, hiddenUuidOnlyClient, nodeDetail]);

  // 极简二次元风格的加载状态
  if (isLoading) {
    return (
      <div className="anime-card flex items-center justify-center p-8 border-dashed border-white/10 bg-black/20">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Synchronizing_Units...</span>
      </div>
    );
  }

  // 极简二次元风格的错误状态
  if (error) {
    return (
      <div className="anime-card flex items-center justify-center p-8 border-rose-500/20 bg-rose-500/5">
        <AlertCircle className="mr-3 h-5 w-5 text-rose-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Signal_Error:: {error}</span>
      </div>
    );
  }

  return (
    <Selector
      // 注入极简暗色风格样式
      className={cn(
        "anime-card bg-black/40 border-white/5 hover:border-purple-500/30 transition-all duration-500 font-bold",
        className
      )}
      hiddenDescription={hiddenDescription}
      value={nodesFiltered}
      onChange={onChange}
      items={[...nodeDetail]}
      // 排序逻辑保持稳定
      sortItems={(a, b) => (a.weight ?? 0) - (b.weight ?? 0)}
      getId={(n) => n.uuid}
      getLabel={(n) => n.name}
      // 翻译预设
      searchPlaceholder={t("common.search")}
      headerLabel={t("common.server")}
    />
  );
};

export default NodeSelector;