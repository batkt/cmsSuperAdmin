"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

import { Toaster } from "react-hot-toast";

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Rehydrate stores
      await useAuthStore.persist.rehydrate();
      
      const { refreshToken, accessToken, setSession, clearSession } = useAuthStore.getState();
      
      // Basic session check/refresh
      if (refreshToken && !accessToken) {
        try {
          const tokens = await api.refresh(refreshToken);
          const me = await api.me(tokens.accessToken);
          if (!cancelled) {
            setSession(tokens.accessToken, tokens.refreshToken, me.user);
          }
        } catch {
          if (!cancelled) clearSession();
        }
      }
      
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b1a] text-slate-300">
        <div className="animate-pulse">Loading session…</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeClient);

  return (
    <QueryClientProvider client={client}>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111622',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px',
          },
        }}
      />
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  );
}
