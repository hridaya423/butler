"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FileText, RefreshCw, X } from "lucide-react";

export function NotionSyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [databaseId, setDatabaseId] = useState("");
  const [apiKey, setApiKey] = useState("");

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
    setApiKey("");
    setDatabaseId("");
  };

  const handleSync = async () => {
    if (!apiKey || !databaseId) {
      setError("Please enter both your Notion API key and database ID");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseId, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = typeof data?.error === 'string' ? data.error : 'Sync failed';
        const detail = typeof data?.details === 'string' ? data.details : null;
        throw new Error(detail ? `${message}: ${detail}` : message);
      }

      console.log(`Synced ${data.itemsProcessed} tasks from Notion`);
      setShowDialog(false);
      setDatabaseId("");
      setApiKey("");

      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error("Notion sync failed:", err);
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
        <FileText className="w-4 h-4" />
        Sync Notion
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
            aria-labelledby="notion-sync-title"
            aria-describedby="notion-sync-description"
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
              <h2 id="notion-sync-title" className="text-lg font-semibold text-gray-900">
                Sync Notion Tasks
              </h2>
              <p id="notion-sync-description" className="text-sm text-gray-500">
                Paste your own Notion integration key and database ID. We only use them for this sync and never persist them.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="notion-api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  Notion API Key
                </label>
                <Input
                  id="notion-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="secret_xxx"
                  disabled={syncing}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  We use this once to read your tasks and never store it.
                </p>
                <p className="text-xs text-gray-500">
                  Need a key? Visit <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noreferrer" className="underline">Notion integrations</a>, create an integration, then paste its Internal Integration Secret here.
                </p>
              </div>

              <div>
                <label htmlFor="notion-database-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Database ID
                </label>
                <Input
                  id="notion-database-id"
                  type="text"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="abc123def456..."
                  disabled={syncing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste either the raw database ID or the full database URL. Make sure your integration has access to this database.
                </p>
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
