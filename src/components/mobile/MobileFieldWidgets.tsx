import { useEffect, useState } from "react";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchScrumDashboard, fetchEfficiencyMetrics } from "@/lib/api";
import { DATA_UPDATED } from "@/lib/events";

export function MobileFieldWidgets() {
  const [sprintData, setSprintData] = useState<any>(null);
  const [efficiencyData, setEfficiencyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dashboard, efficiency] = await Promise.all([
        fetchScrumDashboard(),
        fetchEfficiencyMetrics(),
      ]);

      setSprintData(dashboard);
      setEfficiencyData(efficiency);
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener(DATA_UPDATED, handler);
    return () => window.removeEventListener(DATA_UPDATED, handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-thy-red" />
      </div>
    );
  }

  const sprint = sprintData?.sprint ?? {
    completed: 0,
    total: 1,
    days_remaining: 0,
  };
  const progressPct =
    sprint.total > 0 ? Math.round((sprint.completed / sprint.total) * 100) : 0;

  // Calculate delay risk based on completion rate and days remaining
  const delayRisk =
    sprint.days_remaining > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((sprint.total - sprint.completed) / sprint.days_remaining) * 10
            )
          )
        )
      : progressPct < 100
      ? 100
      : 0;

  const delayRiskLevel =
    delayRisk >= 70 ? "high" : delayRisk >= 40 ? "medium" : "low";

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-800 mb-1">
          Kritik Metrikler
        </h2>
        <p className="text-sm text-zinc-500 font-mono">
          Yüksek seviye operasyonel göstergeler
        </p>
      </div>

      {/* Görev Tamamlama Yüzdesi */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hangar-contrast">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">
                Görev Tamamlama
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Sprint İlerlemesi
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-zinc-800 font-mono">
            {progressPct}%
          </span>
        </div>
        <div className="mb-2">
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-thy-red transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 font-mono">
          <span>{sprint.completed} tamamlandı</span>
          <span>{sprint.total} toplam</span>
        </div>
      </div>

      {/* Gecikme Riski */}
      <div
        className={cn(
          "rounded-xl border-2 p-6 shadow-sm hangar-contrast",
          delayRiskLevel === "high"
            ? "border-amber-500/50 bg-amber-50"
            : delayRiskLevel === "medium"
            ? "border-amber-500/30 bg-amber-50/50"
            : "border-slate-200 bg-white"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                delayRiskLevel === "high"
                  ? "bg-amber-500/20"
                  : delayRiskLevel === "medium"
                  ? "bg-amber-500/10"
                  : "bg-slate-100"
              )}
            >
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  delayRiskLevel === "high"
                    ? "text-amber-600"
                    : delayRiskLevel === "medium"
                    ? "text-amber-600"
                    : "text-zinc-500"
                )}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">
                Gecikme Riski
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {sprint.days_remaining} gün kaldı
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-2xl font-bold font-mono",
              delayRiskLevel === "high"
                ? "text-amber-600"
                : delayRiskLevel === "medium"
                ? "text-amber-600"
                : "text-zinc-700"
            )}
          >
            {delayRisk}%
          </span>
        </div>
        <div className="mb-2">
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                delayRiskLevel === "high"
                  ? "bg-amber-500"
                  : delayRiskLevel === "medium"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${delayRisk}%` }}
            />
          </div>
        </div>
        <p
          className={cn(
            "text-xs font-medium",
            delayRiskLevel === "high"
              ? "text-amber-700"
              : delayRiskLevel === "medium"
              ? "text-amber-700"
              : "text-zinc-600"
          )}
        >
          {delayRiskLevel === "high"
            ? "Yüksek risk: Acil müdahale gerekli"
            : delayRiskLevel === "medium"
            ? "Orta risk: Takip edilmeli"
            : "Düşük risk: Plan takip ediliyor"}
        </p>
      </div>

      {/* Velocity Widget (Simplified) */}
      {sprintData?.sprint && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hangar-contrast">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-thy-red/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-thy-red" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">
                  Ekip Hızı
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Sprint Velocity
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-zinc-800 font-mono">
                {sprintData.sprint.velocity || 0}
              </span>
              <p className="text-xs text-zinc-500 font-mono">
                / {sprintData.sprint.target || 10} hedef
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Info */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] text-zinc-500 font-mono text-center">
          Veriler masaüstü platformdan anlık senkronize ediliyor
        </p>
      </div>
    </div>
  );
}
