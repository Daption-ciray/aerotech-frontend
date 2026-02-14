import { createContext, useContext, useState, ReactNode } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
  device_type?: string;
}

const UserContext = createContext<{
  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
} | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
