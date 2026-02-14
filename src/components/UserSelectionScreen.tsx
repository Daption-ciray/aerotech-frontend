import { useEffect, useState } from "react";
import { Loader2, User, Users } from "lucide-react";
import { fetchUsers, fetchPersonnel } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

interface UserRow {
  id: string;
  name: string;
  role: string;
  device_type?: string;
  personnel_id?: string | null;
}

interface PersonnelRow {
  id: string;
  name: string;
  role?: string;
  linked_user_id?: string | null;
}

export function UserSelectionScreen() {
  const { setCurrentUser } = useUser();
  const [leads, setLeads] = useState<UserRow[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchUsers({ role: "lead" }),
      fetchPersonnel(),
    ])
      .then(([leadList, personnelList]) => {
        setLeads(Array.isArray(leadList) ? leadList : []);
        setPersonnel(Array.isArray(personnelList) ? personnelList : []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectLead = (u: UserRow) => {
    setCurrentUser({
      id: u.id,
      name: u.name,
      role: u.role || "lead",
      device_type: u.device_type || "desktop",
    });
  };

  const handleSelectPersonnel = (p: PersonnelRow) => {
    setCurrentUser({
      id: p.linked_user_id || p.id,
      name: p.name,
      role: "technician",
      device_type: "mobile",
      personnelId: p.id,
    });
  };

  const roleLabel = (r: string) =>
    r === "lead" ? "Lead" : r === "technician" ? "Teknisyen" : r;
  const deviceLabel = (d?: string) =>
    d === "mobile" ? "Mobil" : d === "desktop" ? "Masaüstü" : d || "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-thy-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-amber-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/turkish-technic-logo.png"
            alt="Turkish Technic"
            className="w-14 h-14 object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold text-zinc-800">AeroTech Intelligence</h1>
            <p className="text-sm text-zinc-500">Kullanıcı seçin</p>
          </div>
        </div>

        {/* Lead – masaüstü */}
        {leads.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 px-1">Lead (Masaüstü)</p>
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-200">
                {leads.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => handleSelectLead(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-thy-red/15 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-thy-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-800 truncate">{u.name}</p>
                        <p className="text-xs text-zinc-500">Lead • {deviceLabel(u.device_type)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Personel – mobil (Kaynak Yönetimi personel listesi ile aynı) */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 px-1">Çalışanlar (Mobil)</p>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            {personnel.length === 0 ? (
              <p className="p-6 text-zinc-500 text-center text-sm">Personel listesi boş</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {personnel.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelectPersonnel(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-800 truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">Teknisyen • Mobil</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
