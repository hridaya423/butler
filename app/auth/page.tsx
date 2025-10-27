"use client";

import type { Session } from "@supabase/supabase-js";
import { SignInForm } from "../../components/auth/sign-in-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then((result: any) => {
      const data = result.data;
      const session: Session | null = data?.session ?? null;
      if (session) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    });
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return <SignInForm />;
}
