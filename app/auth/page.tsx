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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return <SignInForm />;
}
