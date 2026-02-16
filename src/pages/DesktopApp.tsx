import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { MaintenancePlanningPage } from "@/pages/MaintenancePlanningPage";
import { SprintPlanningPage } from "@/pages/SprintPlanningPage";
import { ResourceManagementPage } from "@/pages/ResourceManagementPage";
import { WorkPackagesPage } from "@/pages/WorkPackagesPage";
import { EfficiencyAnalysisPage } from "@/pages/EfficiencyAnalysisPage";

type TabId = "planning" | "sprint" | "resources" | "workpackages" | "efficiency";

const PAGE_MAP: Record<TabId, React.ComponentType> = {
  planning: MaintenancePlanningPage,
  sprint: SprintPlanningPage,
  resources: ResourceManagementPage,
  workpackages: WorkPackagesPage,
  efficiency: EfficiencyAnalysisPage,
};

/**
 * Desktop app: Ofis / Planlama & Karar Destek
 * Lead ve planlama ekibi için tam yetkili arayüz.
 * Mobile'dan farklı: Sprint planlama, kaynak yönetimi, verimlilik analizi.
 */
export function DesktopApp() {
  const [activeTab, setActiveTab] = useState<TabId>("planning");

  return (
    <div className="h-screen flex bg-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex min-w-0 border-r border-slate-200 bg-slate-50">
        {(Object.entries(PAGE_MAP) as [TabId, React.ComponentType][]).map(([tabId, PageComponent]) => (
          <div
            key={tabId}
            className="flex-1 flex min-w-0 overflow-auto"
            style={{ display: activeTab === tabId ? "flex" : "none" }}
          >
            <PageComponent />
          </div>
        ))}
        <Dashboard onNavigateToResources={() => setActiveTab("resources")} />
      </main>
    </div>
  );
}
