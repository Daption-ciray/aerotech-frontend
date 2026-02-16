import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileSearch,
  ClipboardList,
  Wrench,
  Shield,
  Loader2,
  Play,
  Plus,
} from "lucide-react";
import { planMaintenance, createWorkPackage } from "@/lib/api";
import { notifyDataUpdated } from "@/lib/events";
import { ChatPanel } from "@/components/ChatPanel";

export function MaintenancePlanningPage() {
  const [faultInput, setFaultInput] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planResult, setPlanResult] = useState<{
    tech_context?: string;
    work_package?: string;
    resource_plan?: string;
    qa_review?: string;
  } | null>(null);
  const [planExpanded, setPlanExpanded] = useState(true);
  const [addingToWp, setAddingToWp] = useState(false);

  const handleAddToWorkPackages = async () => {
    const wp = planResult?.work_package;
    if (!wp || addingToWp) return;
    setAddingToWp(true);
    try {
      const parsed = parseWorkPackageJson(wp, faultInput.trim());
      await createWorkPackage(parsed);
      notifyDataUpdated();
      alert("İş paketi eklendi.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eklenemedi");
    } finally {
      setAddingToWp(false);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const desc = faultInput.trim();
    if (!desc || planLoading) return;
    setPlanLoading(true);
    setPlanResult(null);
    try {
      const res = await planMaintenance(desc);
      setPlanResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bağlantı hatası. Backend çalışıyor mu?";
      setPlanResult({ tech_context: msg });
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Bakım Planı (Search + Planner + Resource + PlanReview agent'ları) */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white">
        <button
          onClick={() => setPlanExpanded(!planExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-thy-red" />
            <h2 className="text-lg font-semibold text-zinc-800">Bakım Planı Oluştur</h2>
          </div>
          {planExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </button>
        {planExpanded && (
          <div className="px-6 pb-4 space-y-3">
            <p className="text-sm text-zinc-500">
              Arıza açıklaması girerek teknik analiz, iş paketi, kaynak planı ve QA incelemesi alın (Search → Planner → Resource → PlanReview)
            </p>
            <form onSubmit={handlePlanSubmit} className="flex gap-2">
              <input
                value={faultInput}
                onChange={(e) => setFaultInput(e.target.value)}
                placeholder="Örn: A320 elevator trim sistemi aşırı titreşim yapıyor"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-500"
                disabled={planLoading}
              />
              <button
                type="submit"
                disabled={planLoading || !faultInput.trim()}
                className="rounded-lg bg-thy-red px-4 py-2.5 text-sm font-medium text-white hover:bg-thy-red-hover disabled:opacity-50 flex items-center gap-2"
              >
                {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Planla
              </button>
            </form>
            {planResult && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {planResult.tech_context && (
                  <ResultCard icon={FileSearch} label="Teknik Analiz (Search RAG)" content={planResult.tech_context} />
                )}
                {planResult.work_package && (
                  <ResultCard
                    icon={ClipboardList}
                    label="İş Paketi (Planner)"
                    content={planResult.work_package}
                    action={
                      <button
                        onClick={handleAddToWorkPackages}
                        disabled={addingToWp}
                        className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded text-xs font-medium bg-thy-red text-white hover:bg-thy-red-hover disabled:opacity-50"
                      >
                        {addingToWp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        İş Paketine Ekle
                      </button>
                    }
                  />
                )}
                {planResult.resource_plan && (
                  <ResultCard icon={Wrench} label="Kaynak Planı (Resource)" content={planResult.resource_plan} />
                )}
                {planResult.qa_review && (
                  <ResultCard icon={Shield} label="QA İnceleme (PlanReview)" content={planResult.qa_review} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teknik Sohbet (Guard + QA + Part Visual) */}
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  );
}

function parseWorkPackageJson(raw: string, fallbackTitle?: string): Record<string, unknown> {
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  let s = raw.trim();
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) s = m[1].trim();
  const str = (v: unknown): string => (v != null ? String(v) : "");
  try {
    const o = JSON.parse(s) as Record<string, unknown>;
    const id = str(o.work_package_id ?? o.id).trim() || `WP-${Date.now().toString(36).slice(-6)}-${Math.random().toString(36).slice(2, 8)}`;
    const title = str(o.component ?? o.title ?? o.aircraft_type ?? fallbackTitle).trim() || "Yeni iş paketi";
    const aircraft = str(o.aircraft_type ?? o.aircraft).trim() || "A320";
    const ata = str(o.ata).trim() || "27";
    return {
      id,
      title,
      aircraft,
      ata,
      status: "pending",
      assigned_to: null,
      due_date: dueDate,
    };
  } catch {
    return {
      id: `WP-${Date.now().toString(36).slice(-6)}`,
      title: (fallbackTitle || raw.slice(0, 80) || "Yeni iş paketi").toString().slice(0, 200),
      aircraft: "A320",
      ata: "27",
      status: "pending",
      assigned_to: null,
      due_date: dueDate,
    };
  }
}

function ResultCard({
  icon: Icon,
  label,
  content,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  content: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-thy-red" />
        <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{label}</span>
      </div>
      <pre className="text-xs text-zinc-700 whitespace-pre-wrap font-sans overflow-x-auto max-h-48 overflow-y-auto">
        {content}
      </pre>
      {action}
    </div>
  );
}
