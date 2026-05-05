"use client";

import { useEffect, useState } from "react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useTranslation } from "react-i18next";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { formatBytes } from "@/utils/unitHelper";
import { useNodeList } from "@/contexts/NodeListContext";
import fillMissingTimePoints, { type RecordFormat } from "@/utils/RecordHelper";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import Loading from "@/components/loading";

type LoadChartProps = {
  uuid: string;
  data: RecordFormat[];
  intervalSec?: number;
};

const LoadChart = ({ uuid, data = [] }: LoadChartProps) => {
  const { t } = useTranslation();
  const { live_data: all_live_data } = useLiveData();
  const { nodeList } = useNodeList();
  const { publicInfo } = usePublicInfo();
  const max_record_preserve_time = publicInfo?.record_preserve_time || 0;
  const [hoursView, setHoursView] = useState<string>("real-time");
  const [remoteData, setRemoteData] = useState<RecordFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 这里的配色方案已更新为二次元暗色系 ---
  const ANIME_COLORS = {
    primary: "#a855f7", // 极光紫
    secondary: "#34d399", // 萤光绿
    accent: "#60a5fa", // 赛博蓝
    warning: "#fbbf24", // 琥珀橙
    grid: "rgba(255, 255, 255, 0.05)"
  };

  const presetViews = [
    { label: t("chart.hours", { count: 4 }), hours: 4 },
    { label: t("chart.days", { count: 1 }), hours: 24 },
    { label: t("chart.days", { count: 7 }), hours: 168 },
    { label: t("chart.days", { count: 30 }), hours: 720 },
  ];
  
  const avaliableView: { label: string; hours?: number }[] = [
    { label: t("common.real_time") },
  ];
  
  if (typeof max_record_preserve_time === "number" && max_record_preserve_time > 0) {
    for (const v of presetViews) {
      if (max_record_preserve_time >= v.hours) {
        avaliableView.push({ label: v.label, hours: v.hours });
      }
    }
  }

  useEffect(() => {
    if (avaliableView.length > 0) setHoursView(avaliableView[0].label);
  }, [max_record_preserve_time]);

  useEffect(() => {
    const selected = avaliableView.find((v) => v.label === hoursView);
    if (!uuid || !selected?.hours) {
      setRemoteData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/records/load?uuid=${uuid}&hours=${selected.hours}`)
      .then((res) => res.json())
      .then((resp) => {
        const records = resp.data?.records || [];
        records.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setRemoteData(records);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hoursView, uuid]);

  const chartMargin = { top: 10, right: 10, bottom: 0, left: 10 };
  const live_data = all_live_data?.data?.data[uuid ?? ""];
  const node = nodeList?.find((n) => n.uuid === uuid);

  const isRealtime = hoursView === t("common.real_time") || hoursView === "real-time";
  const chartData = isRealtime 
    ? data.slice(-150) 
    : fillMissingTimePoints(remoteData ?? [], 60, 3600 * (avaliableView.find(v=>v.label===hoursView)?.hours || 24), 120);

  const CustomChartTitle = (title: string, value: React.ReactNode) => (
    <div className="flex justify-between items-end mb-4 px-2">
      <div className="flex flex-col">
        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-1">{title} Status</span>
        <h4 className="text-xl font-black italic tracking-tighter text-white/90">{title}</h4>
      </div>
      <div className="text-right font-mono text-sm font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
        {value}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 时间选择器 - 磨砂质感 */}
      <div className="flex justify-center w-full px-2">
        <div className="bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <SegmentedControl value={hoursView} onValueChange={setHoursView} className="bg-transparent border-none">
            {avaliableView.map((view) => (
              <SegmentedControlItem key={view.label} value={view.label} className="text-[10px] uppercase font-bold tracking-wider px-4">
                {view.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      </div>

      {(loading || error) && (
        <div className="py-10 text-center italic text-xs opacity-40 uppercase tracking-widest">
          {loading ? <Loading /> : error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        
        {/* CPU 趋势图 */}
        <div className="anime-card p-6">
          {CustomChartTitle("CPU", live_data?.cpu?.usage ? `${live_data.cpu.usage.toFixed(1)}%` : "-")}
          <ChartContainer config={{ cpu: { label: "Usage", color: ANIME_COLORS.secondary } }}>
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ANIME_COLORS.secondary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={ANIME_COLORS.secondary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ANIME_COLORS.grid} vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <ChartTooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} content={<ChartTooltipContent indicator="line" />} />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke={ANIME_COLORS.secondary} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorCpu)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* RAM 趋势图 */}
        <div className="anime-card p-6">
          {CustomChartTitle("Memory", live_data?.ram?.used ? formatBytes(live_data.ram.used) : "-")}
          <ChartContainer config={{ ram: { label: "RAM", color: ANIME_COLORS.primary } }}>
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ANIME_COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={ANIME_COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ANIME_COLORS.grid} vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <ChartTooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} content={<ChartTooltipContent indicator="line" />} />
              <Area 
                type="monotone" 
                dataKey="ram" 
                stroke={ANIME_COLORS.primary} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRam)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Network 趋势图 - 线条风格 */}
        <div className="anime-card p-6">
          {CustomChartTitle("Network", `↑${formatBytes(live_data?.network.up || 0)}/s`)}
          <ChartContainer config={{ 
            net_in: { label: "Down", color: ANIME_COLORS.accent },
            net_out: { label: "Up", color: ANIME_COLORS.warning }
          }}>
            <LineChart data={chartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={ANIME_COLORS.grid} vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="stepAfter" dataKey="net_in" stroke={ANIME_COLORS.accent} strokeWidth={2} dot={false} animationDuration={1000} />
              <Line type="stepAfter" dataKey="net_out" stroke={ANIME_COLORS.warning} strokeWidth={2} dot={false} animationDuration={1000} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* TCP/UDP 趋势图 */}
        <div className="anime-card p-6">
          {CustomChartTitle("Connectivity", `${live_data?.connections.tcp || 0} TCP`)}
          <ChartContainer config={{ 
            connections: { label: "TCP", color: ANIME_COLORS.accent }
          }}>
            <LineChart data={chartData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke={ANIME_COLORS.grid} vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="connections" stroke={ANIME_COLORS.accent} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>

      </div>
    </div>
  );
};

export default LoadChart;