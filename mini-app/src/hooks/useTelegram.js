import { useState, useEffect, useCallback } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user || null);
    }
  }, []);

  const expand = useCallback(() => {
    tg?.expand();
  }, [tg]);

  const ready = useCallback(() => {
    tg?.ready();
  }, [tg]);

  const close = useCallback(() => {
    tg?.close();
  }, [tg]);

  return { tg, user, expand, ready, close };
}