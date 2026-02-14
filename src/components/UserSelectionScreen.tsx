import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { fetchUsers } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

interface UserRow {
  id: string;
  name: string;
  role: string;
  device_type?: string;
}

export function UserSelectionScreen() {
  const { setCurrentUser } = useUser();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (u: UserRow) => {
    setCurrentUser({
      id: u.id,
      name: u.name,
      role: u.role || "technician",
      device_type: u.device_type,
    });
  };

  const roleLabel = (r: string) => (r === "lead" ? "Lead" : r === "technician" ? "Teknisyen" : r);
  const deviceLabel = (d?: string) => (d === "mobile" ? "Mobil" : d === "desktop" ? "Masaüstü" : d || "—");

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
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <p className="p-6 text-zinc-500 text-center">Kullanıcı bulunamadı</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => handleSelect(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-thy-red/15 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-thy-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-800 truncate">{u.name}</p>
                      <p className="text-xs text-zinc-500">
                        {roleLabel(u.role)} • {deviceLabel(u.device_type)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
