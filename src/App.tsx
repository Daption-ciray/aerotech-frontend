import { useState, useEffect } from "react";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { UserSelectionScreen } from "@/components/UserSelectionScreen";
import { MobileApp } from "@/pages/MobileApp";
import { DesktopApp } from "@/pages/DesktopApp";

function AppContent() {
  const { currentUser } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileParam = urlParams.get("mobile");

    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileParam === "true" || (mobileParam === null && isMobileDevice));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!currentUser) {
    return <UserSelectionScreen />;
  }

  if (isMobile) {
    return <MobileApp />;
  }

  return <DesktopApp />;
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
