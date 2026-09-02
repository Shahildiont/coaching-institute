import { useEffect, useState } from "react";

function getInitialStatus() {
  if (typeof window === "undefined") return true;
  return window.navigator.onLine;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(getInitialStatus);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;