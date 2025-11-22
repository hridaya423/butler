"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Zap, Mail, Calendar, CheckCircle2 } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const hasVisited = localStorage.getItem("butler_has_visited");
    if (hasVisited) {
      setFlow("signIn");
    } else {
      localStorage.setItem("butler_has_visited", "true");
    }
    setError(null);
  }, []);

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


  const actions = [
    { icon: <Mail className="w-4 h-4 text-blue-500" />, title: "Inbox Zero achieved", time: "Just now", color: "bg-blue-50 border-blue-100" },
    { icon: <Calendar className="w-4 h-4 text-orange-500" />, title: "Meeting rescheduled", time: "2m ago", color: "bg-orange-50 border-orange-100" },
    { icon: <Zap className="w-4 h-4 text-yellow-500" />, title: "Follow-up drafted", time: "5m ago", color: "bg-yellow-50 border-yellow-100" },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, title: "Weekly report sent", time: "12m ago", color: "bg-green-50 border-green-100" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white">

      <div className="hidden lg:flex w-1/2 bg-neutral-50 relative items-center justify-center overflow-hidden border-r border-neutral-100">

        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 w-full max-w-md px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 shadow-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Live Activity</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              Your personal assistant,<br />
              <span className="text-neutral-400">working in the background.</span>
            </h2>
          </div>

          <div className="space-y-4 relative">

            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-neutral-50 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-50 to-transparent z-20 pointer-events-none" />

            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm bg-white ${action.color === 'bg-white' ? 'border-neutral-100' : 'border-neutral-100'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{action.title}</p>
                  <p className="text-xs text-neutral-400">{action.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
              {flow === "signIn" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-neutral-500">
              {flow === "signIn"
                ? "Enter your credentials to access your workspace."
                : "Create your account to start organizing your life."}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-medium transition-all"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-medium transition-all"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-neutral-700 uppercase tracking-wide">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="h-11 bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-neutral-700 uppercase tracking-wide">
                    Password
                  </label>
                  {flow === "signIn" && (
                    <button type="button" className="text-xs text-neutral-500 hover:text-orange-600 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {flow === "signIn" ? "Sign In" : "Sign Up"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-sm text-neutral-500 hover:text-orange-600 transition-colors"
            >
              {flow === "signIn"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
