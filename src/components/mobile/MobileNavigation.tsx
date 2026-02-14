import { ClipboardList, Bot, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileTab = "tasks" | "ai" | "metrics";

interface MobileNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: Array<{
  id: MobileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "tasks",
    label: "Görevler",
    icon: ClipboardList,
  },
  {
    id: "ai",
    label: "AI",
    icon: Bot,
  },
  {
    id: "metrics",
    label: "Metrikler",
    icon: BarChart3,
  },
];

export function MobileNavigation({
  activeTab,
  onTabChange,
}: MobileNavigationProps) {
  return (
    <nav className="flex-shrink-0 bg-white border-t-2 border-slate-200 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all min-w-[80px]",
                "active:scale-95",
                isActive
                  ? "bg-thy-red/10 text-thy-red"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-thy-red" : "text-zinc-500"
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold transition-colors",
                  isActive ? "text-thy-red" : "text-zinc-500"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
