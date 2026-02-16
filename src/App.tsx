import { UserProvider, useUser } from "@/contexts/UserContext";
import { UserSelectionScreen } from "@/components/UserSelectionScreen";
import { MobileApp } from "@/pages/MobileApp";
import { DesktopApp } from "@/pages/DesktopApp";

function AppContent() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <UserSelectionScreen />;
  }

  // Lead → sadece masaüstü/lead sayfaları | Teknisyen → sadece mobil/çalışan sayfaları
  if (currentUser.role === "lead") {
    return <DesktopApp />;
  }

  return <MobileApp />;
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
