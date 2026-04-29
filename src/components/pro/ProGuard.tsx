"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureProSession } from "@/lib/proApi";

type ProGuardProps = {
  children: React.ReactNode;
};

export function ProGuard({ children }: ProGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureProSession()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        const next = encodeURIComponent(pathname || "/pro/dashboard");
        router.replace(`/pro/login?next=${next}`);
      });
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="rounded-[24px] border border-[var(--pro-border)] bg-[var(--pro-panel)] px-5 py-10 text-center shadow-sm">
        <p className="text-sm text-[var(--pro-text-muted)]">Verification de la session en cours...</p>
      </div>
    );
  }

  return <>{children}</>;
}
