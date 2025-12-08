'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';

interface SlackConnectProps {
  onConnected?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SlackConnect({
  onConnected,
  variant = 'default',
  size = 'default',
  className = '',
}: SlackConnectProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);

    try {
      const response = await fetch('/api/slack/connect/authorize');

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to initiate Slack connection: ${error.error}`);
        setConnecting(false);
        return;
      }

      const data = await response.json();

      window.location.href = data.url;

    } catch (error) {
      alert('Failed to connect to Slack. Please try again.');
      setConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      <MessageSquare className="w-4 h-4" />
      {connecting ? 'Connecting...' : 'Connect Workspace'}
    </Button>
  );
}
