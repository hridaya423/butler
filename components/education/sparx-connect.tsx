"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calculator,
    Search,
    Loader2,
    Lock,
    School,
    Eye,
    EyeOff,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SparxConnectProps {
    onConnected: () => void;
}

const DEFAULT_SCHOOL_URL = process.env.NEXT_SPARX_SCHOOL_URL || "";

export function SparxConnect({ onConnected }: SparxConnectProps) {
    const [step, setStep] = useState<"school" | "credentials">("school");
    const [schoolQuery, setSchoolQuery] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [useDefaultSchool, setUseDefaultSchool] = useState(false);

    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

    const supabase = createClient();

    const handleLogoClick = () => {
        clickCountRef.current += 1;

        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
        }

        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0;
        }, 500);

        if (clickCountRef.current >= 3) {
            clickCountRef.current = 0;
            setUseDefaultSchool(true);
            setSelectedSchool({ id: "default", name: "Your School" });
            setStep("credentials");
        }
    };

    const handleSchoolSearch = async () => {
        if (!schoolQuery.trim()) return;
        toast("School search coming soon", {
            description: "Enter your school name and we'll help you find it.",
            icon: "ℹ️",
        });
    };

    const handleConnect = async () => {
        if (!username || !password) {
            toast("Please enter your username and password", { icon: "❌" });
            return;
        }

        setConnecting(true);

        try {
            const response = await fetch("/api/sync/sparx/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                    schoolId: selectedSchool?.id,
                    schoolName: selectedSchool?.name,
                    useDefaultSchool,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Connection failed");
            }

            toast("Sparx connected successfully!", { icon: "✅" });
            onConnected();
        } catch (error) {
            toast(error instanceof Error ? error.message : "Failed to connect to Sparx", { icon: "❌" });
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <button
                onClick={handleLogoClick}
                className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-6 transition-transform hover:scale-105 cursor-pointer"
                aria-label="Sparx Maths"
            >
                <Calculator className="w-10 h-10 text-purple-600" />
            </button>

            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
                Connect Sparx Maths
            </h3>

            {step === "school" ? (
                <>
                    <p className="text-sm text-neutral-500 max-w-sm mb-6">
                        First, let's find your school. Start typing your school name to search.
                    </p>

                    <div className="w-full max-w-sm space-y-4">
                        <div className="relative">
                            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search for your school..."
                                value={schoolQuery}
                                onChange={(e) => setSchoolQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSchoolSearch()}
                                className="pl-10"
                            />
                        </div>

                        <Button
                            onClick={handleSchoolSearch}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Search Schools
                        </Button>

                    </div>
                </>
            ) : (
                <>
                    <p className="text-sm text-neutral-500 max-w-sm mb-2">
                        {selectedSchool?.name && (
                            <span className="flex items-center justify-center gap-2 mb-2">
                                <School className="w-4 h-4" />
                                {selectedSchool.name}
                                {useDefaultSchool && (
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                )}
                            </span>
                        )}
                        Enter your Sparx login credentials.
                    </p>

                    <div className="w-full max-w-sm space-y-4 mt-4">
                        <div className="text-left space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your Sparx username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="text-left space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {connecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Connect Sparx
                                </>
                            )}
                        </Button>

                        <button
                            onClick={() => {
                                setStep("school");
                                setSelectedSchool(null);
                                setUseDefaultSchool(false);
                            }}
                            className="text-sm text-neutral-500 hover:text-neutral-700"
                        >
                            ← Choose a different school
                        </button>
                    </div>
                </>
            )}

            <p className="text-xs text-neutral-400 mt-8 max-w-sm">
                Your credentials are encrypted and stored securely. We only use them to sync your homework.
            </p>
        </div>
    );
}
