"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { FileText, RefreshCw } from "lucide-react";

export function NotionSyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);

    try {
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sync failed');
      }

      const data = await response.json();
      console.log(`Synced ${data.itemsProcessed} tasks from Notion`);

      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error("Notion sync failed:", err);
      if (err instanceof Error && err.message.includes('not connected')) {
        window.location.href = '/dashboard?section=settings&tab=accounts';
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm"
      onClick={handleSync}
      disabled={syncing}
    >
      {syncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <FileText className="w-3.5 h-3.5" />
          Sync Notion
        </>
      )}
    </Button>
  );
}
