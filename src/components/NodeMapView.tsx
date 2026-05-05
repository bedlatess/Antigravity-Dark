"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { useTranslation } from "react-i18next";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "@/types/LiveData";
import worldCountries50m from "@/data/world-countries-50m.json";
import { buildMapViewSummary } from "@/utils/mapRegions";
import { Card, CardContent } from "@/components/ui/card";
import Flag from "@/components/Flag";
import { cn } from "@/lib/utils";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;

export function NodeMapView({ nodes, liveData, mapOnly = false }: any) {
  const { t } = useTranslation();
  const summary = useMemo(() => buildMapViewSummary(nodes, liveData), [nodes, liveData]);
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);

  const activeRegionsByMapName = useMemo(
    () => new Map(summary.regions.map((region) => [region.mapName, region])),
    [summary.regions]
  );

  const projectedMap = useMemo(() => {
    const countriesGeo = feature(worldCountries50m as any, (worldCountries50m as any).objects.countries) as any;
    const projection = geoNaturalEarth1().fitExtent([[20, 20], [SVG_WIDTH - 20, SVG_HEIGHT - 20]], countriesGeo);
    const pathGenerator = geoPath(projection);

    return countriesGeo.features.map((country: any) => ({
      name: country.properties?.name || "Unknown",
      pathData: pathGenerator(country) || "",
      activeRegion: activeRegionsByMapName.get(country.properties?.name) || null,
    }));
  }, [activeRegionsByMapName]);

  return (
    <Card className="border-none bg-transparent shadow-none overflow-visible">
      <CardContent className="p-0 relative">
        <div className="relative bg-black/40 rounded-[2rem] border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
            <g>
              {projectedMap.map((country: any) => {
                const isActive = !!country.activeRegion;
                return (
                  <path
                    key={country.name}
                    d={country.pathData}
                    onPointerEnter={() => isActive && setHoveredRegion(country.activeRegion)}
                    onPointerLeave={() => setHoveredRegion(null)}
                    className={cn(
                      "transition-all duration-500 outline-none",
                      isActive 
                        ? "fill-purple-500/60 stroke-purple-400 stroke-[1px] cursor-help filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                        : "fill-white/[0.03] stroke-white/[0.05] stroke-[0.5px] pointer-events-none"
                    )}
                  />
                );
              })}
            </g>
          </svg>

          {/* 只有鼠标移动到点亮区域才显示浮窗 */}
          {hoveredRegion && (
            <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-black/80 backdrop-blur-md border border-purple-500/40 p-4 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  {/* 修复：移除 Flag 上的 className，改用 div 包裹控制大小 */}
                  <div className="size-5 flex items-center justify-center">
                    <Flag flag={hoveredRegion.emoji} />
                  </div>
                  <span className="text-sm font-black uppercase text-white">{hoveredRegion.label}</span>
                </div>
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Active Units: {hoveredRegion.online} / {hoveredRegion.total}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}