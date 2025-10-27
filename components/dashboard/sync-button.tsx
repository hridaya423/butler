"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RefreshCw, X } from "lucide-react";

export function SyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!showDialog) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !syncing) {
        event.preventDefault();
        setShowDialog(false);
        setError(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDialog, syncing]);

  const closeDialog = () => {
    if (syncing) return;
    setShowDialog(false);
    setError(null);
  };

  const handleSync = async () => {
    if (!email || !password) {
      setError("Please enter your Bromcom credentials");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync/bromcom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      console.log(`Synced ${data.itemsProcessed} assignments`);
      setShowDialog(false);

      setEmail("");
      setPassword("");

      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error("Sync failed:", err);
      const message = err instanceof Error ? err.message : "Sync failed";
      setError(message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setShowDialog(true)}
      >
        <RefreshCw className="w-4 h-4" />
        Sync Bromcom
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bromcom-sync-title"
            aria-describedby="bromcom-sync-description"
            className="relative z-[101] w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeDialog}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close dialog</span>
            </button>

            <div className="space-y-2 pr-8">
              <h2 id="bromcom-sync-title" className="text-lg font-semibold text-gray-900">
                Sync Bromcom Homework
              </h2>
              <p id="bromcom-sync-description" className="text-sm text-gray-500">
                Enter your Bromcom credentials to sync your homework assignments. Your credentials are not stored.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="bromcom-email" className="block text-sm font-medium text-gray-700 mb-2">
                  School Email
                </label>
                <Input
                  id="bromcom-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  disabled={syncing}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="bromcom-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="bromcom-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={syncing}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                onClick={handleSync}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
