"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamsConnectProps {
    onConnected: () => void;
}

export function TeamsConnect({ onConnected }: TeamsConnectProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast("Please enter both email and password", { icon: "⚠️" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/sync/teams/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to connect");
            }

            toast("Microsoft Teams connected! Starting sync...", { icon: "✅" });

            await fetch("/api/sync/teams", { method: "POST" });

            onConnected();
        } catch (error: any) {
            toast(error.message || "Failed to connect to Teams", { icon: "❌" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-indigo-600" />
            </div>

            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2 text-center">
                Connect Microsoft Teams
            </h3>

            <p className="text-sm text-neutral-500 max-w-sm mb-8 text-center">
                Enter your school Microsoft account credentials to sync your Teams assignments.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="teams-email">School Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            id="teams-email"
                            type="email"
                            placeholder="student@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="teams-password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            id="teams-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            disabled={loading}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4 mr-2" />
                            Connect Teams
                        </>
                    )}
                </Button>
            </form>

            <p className="text-xs text-neutral-400 mt-8 max-w-sm text-center">
                Your credentials are encrypted and stored securely. We only access your assignments and class information.
            </p>
        </div>
    );
}
