// Railway / prod için backend URL'ini ortam değişkeninden okuyoruz.
// Desteklenen env değişkenleri:
// - VITE_API_URL
// - VITE_API_BASE_URL
// Hiçbiri yoksa, local geliştirme / reverse proxy senaryosu için "/api".
// VITE_API_URL / VITE_API_BASE_URL yoksa "/api" kullanılır → Vite proxy ile localhost:8000'e gider
// Örn: VITE_API_URL=http://localhost:8000 ile doğrudan backend (proxy bypass)
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

export async function sendQuestion(question: string): Promise<{
  answer: string;
  part_diagram?: {
    image_base64?: string;
    part_name?: string;
    verified?: boolean;
    reason?: string;
  } | null;
}> {
  const res = await fetch(`${API_BASE}/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `QA hatası (${res.status})`);
  }
  const data = await res.json();
  return {
    answer: data.answer ?? "",
    part_diagram: data.part_diagram ?? null,
  };
}

export async function planMaintenance(
  faultDescription: string
): Promise<{
  tech_context?: string;
  work_package?: string;
  resource_plan?: string;
  qa_review?: string;
}> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fault_description: faultDescription }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || "Plan request failed");
  }
  return res.json();
}

// Kaynak & Ekipman
export async function fetchPersonnel() {
  const res = await fetch(`${API_BASE}/resources/personnel`);
  if (!res.ok) throw new Error("Personnel fetch failed");
  const data = await res.json();
  return data.personnel ?? [];
}

export async function fetchTools() {
  const res = await fetch(`${API_BASE}/resources/tools`);
  if (!res.ok) throw new Error("Tools fetch failed");
  const data = await res.json();
  return data.tools ?? [];
}

export async function fetchParts() {
  const res = await fetch(`${API_BASE}/resources/parts`);
  if (!res.ok) throw new Error("Parts fetch failed");
  const data = await res.json();
  return data.parts ?? [];
}

// İş Paketleri
export async function fetchWorkPackages() {
  const res = await fetch(`${API_BASE}/work-packages`);
  if (!res.ok) throw new Error("Work packages fetch failed");
  const data = await res.json();
  return data.work_packages ?? [];
}

// Kullanıcılar (desktop + mobile)
export async function fetchUsers(params?: { role?: string; device_type?: string }) {
  const search = new URLSearchParams();
  if (params?.role) search.set("role", params.role);
  if (params?.device_type) search.set("device_type", params.device_type);
  const qs = search.toString();
  const url = qs ? `${API_BASE}/users?${qs}` : `${API_BASE}/users`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Users fetch failed");
  const data = await res.json();
  return data.users ?? [];
}

// Belirli bir kullanıcıya atanmış iş paketleri (mobil kullanım için)
export async function fetchUserWorkPackages(userId: string) {
  if (!userId) return [];
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/work-packages`);
  if (!res.ok) throw new Error("User work packages fetch failed");
  const data = await res.json();
  return data.work_packages ?? [];
}

// Verimlilik
export async function fetchEfficiencyMetrics() {
  const res = await fetch(`${API_BASE}/efficiency/metrics`);
  if (!res.ok) throw new Error("Efficiency metrics fetch failed");
  return res.json();
}

/** LLM tabanlı verimlilik analizi + öneriler (backend /analytics/efficiency) */
export async function fetchAnalyticsEfficiency(): Promise<{
  summary?: string;
  suggestions?: string[];
}> {
  const res = await fetch(`${API_BASE}/analytics/efficiency`);
  if (!res.ok) throw new Error("Analytics efficiency fetch failed");
  return res.json();
}

export async function fetchEfficiencyMonthly() {
  const res = await fetch(`${API_BASE}/efficiency/monthly`);
  if (!res.ok) throw new Error("Efficiency monthly fetch failed");
  const data = await res.json();
  return data.monthly ?? [];
}

// Scrum Dashboard
export async function fetchScrumDashboard() {
  const res = await fetch(`${API_BASE}/scrum/dashboard`);
  if (!res.ok) throw new Error("Scrum dashboard fetch failed");
  return res.json();
}

// Sprint yaşam döngüsü (başlat / bitir)
export async function fetchSprintState(): Promise<{
  status: string;
  name?: string | null;
  goal?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  days_remaining?: number;
  duration_days?: number;
}> {
  const res = await fetch(`${API_BASE}/sprint/state`);
  if (!res.ok) throw new Error("Sprint state fetch failed");
  return res.json();
}

export async function startSprint(data: {
  name?: string | null;
  goal?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_days?: number;
}) {
  const res = await fetch(`${API_BASE}/sprint/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name || null,
      goal: data.goal || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      duration_days: data.duration_days ?? 14,
    }),
  });
  if (!res.ok) throw new Error("Sprint start failed");
  return res.json();
}

export async function endSprint() {
  const res = await fetch(`${API_BASE}/sprint/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Sprint end failed");
  return res.json();
}

// Sprint Planning (doğal dil ile backlog yönetimi)
export async function sprintPlan(request: string): Promise<{
  operation?: string;
  created?: string[];
  backlog_size?: number;
  items?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    sprint?: string;
    priority?: number;
    estimate_hours?: number;
    owner?: string;
  }>;
  item?: Record<string, unknown>;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/sprint/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request }),
  });
  if (!res.ok) throw new Error("Sprint plan request failed");
  return res.json();
}

// Plan review (sadece QA raporu – harici bağlam + iş paketi + kaynak planı)
export async function reviewPlan(body: {
  tech_context: string;
  work_package: string;
  resource_plan: string;
}): Promise<{ qa_review: string }> {
  const res = await fetch(`${API_BASE}/plan/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Plan review failed");
  return res.json();
}

// Tamamlanan iş paketi kaydı (verimlilik analizi için)
export async function addCompletedPackage(data: {
  id: string;
  work_package_id: string;
  sprint_id?: string | null;
  started_at: string;
  completed_at: string;
  first_pass_success: boolean;
  rework_count?: number;
  planned_minutes?: number | null;
  actual_minutes?: number | null;
  assigned_personnel_count?: number | null;
  criticality?: string | null;
}): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/analytics/completed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Add completed package failed");
  return res.json();
}

// Tekil kaynak getir (detay sayfası / form düzenleme için)
export async function getPersonnel(id: string) {
  const res = await fetch(`${API_BASE}/resources/personnel/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Personnel fetch failed");
  return res.json();
}
export async function getTool(id: string) {
  const res = await fetch(`${API_BASE}/resources/tools/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Tool fetch failed");
  return res.json();
}
export async function getPart(id: string) {
  const res = await fetch(`${API_BASE}/resources/parts/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Part fetch failed");
  return res.json();
}
export async function getWorkPackage(id: string) {
  const res = await fetch(`${API_BASE}/work-packages/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Work package fetch failed");
  return res.json();
}

// Kullanıcı CRUD (GET liste zaten fetchUsers)
export async function getUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("User fetch failed");
  return res.json();
}
export async function createUser(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create user failed");
  return res.json();
}
export async function updateUser(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update user failed");
  return res.json();
}
export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete user failed");
  return res.json();
}

// CRUD - Personnel
export async function createPersonnel(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/personnel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}
export async function updatePersonnel(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/personnel/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
export async function deletePersonnel(id: string) {
  const res = await fetch(`${API_BASE}/resources/personnel/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

// CRUD - Tools
export async function createTool(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}
export async function updateTool(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/tools/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
export async function deleteTool(id: string) {
  const res = await fetch(`${API_BASE}/resources/tools/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

// CRUD - Parts
export async function createPart(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/parts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}
export async function updatePart(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/resources/parts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
export async function deletePart(id: string) {
  const res = await fetch(`${API_BASE}/resources/parts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

// CRUD - Work Packages
export async function createWorkPackage(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/work-packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string | { msg?: string }[] };
    const d = err?.detail;
    const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x?.msg).filter(Boolean).join("; ") : null;
    throw new Error(msg || res.statusText || "Create failed");
  }
  return res.json();
}
export async function updateWorkPackage(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/work-packages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
export async function deleteWorkPackage(id: string) {
  const res = await fetch(`${API_BASE}/work-packages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}
