"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

export function SignInForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [flow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (flow === "signUp") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-gray-100 px-6 py-10">
      <div className="w-full max-w-5xl grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1
                className="text-4xl text-gray-900 leading-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Your  ommand center—minus the wait.
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-xl">
                The functionality is limited because of only 6h of work..Only the Notion importer is wired up to Supabase right nowg
              </p>
            </div>
            
            </div>
          </div>
        </div>

        <Card className="p-8 bg-white border-gray-200 shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              {flow === "signIn" ? "Sign back in" : "Create an account"}
            </h2>
            <p className="text-xs text-gray-400">
              Remember: only Notion-based data is saved, bromcom credentials you probably wont have, and it&apos;s realistically only for me.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB7C1C] hover:bg-[#e56b0a] text-white"
            >
              {loading
                ? "Please wait..."
                : flow === "signIn"
                ? "Sign In"
                : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-sm text-gray-600 hover:text-[#FB7C1C] transition-colors"
            >
              {flow === "signIn"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>
  );
}
