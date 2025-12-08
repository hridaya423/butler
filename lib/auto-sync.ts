
import { createClient } from '@/lib/supabase/client';

interface SyncSchedule {
  github?: number;
  stripe?: number;
  slack?: number;
  gmail?: number;
  notion?: number;
  bromcom?: number;
  sparx?: number;
  teams?: number;
}

const DEFAULT_SCHEDULE: SyncSchedule = {
  github: 6,
  stripe: 2,
  slack: 1,
  gmail: 3,
  notion: 24,
  bromcom: 12,
  sparx: 168,
  teams: 24,
};

class AutoSyncScheduler {
  private supabase = createClient();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private lastSyncs: Map<string, Date> = new Map();


  async start(service: keyof SyncSchedule, customInterval?: number) {
    const hours = customInterval || DEFAULT_SCHEDULE[service];
    if (!hours) return;

    const intervalMs = hours * 60 * 60 * 1000;
    const serviceName = service.toString();

    this.stop(service);

    const lastSync = await this.getLastSyncTime(service);
    const now = new Date();

    if (!lastSync || (now.getTime() - lastSync.getTime()) > intervalMs) {
      await this.sync(service);
    }
    const interval = setInterval(async () => {
      await this.sync(service);
    }, intervalMs);

    this.intervals.set(serviceName, interval);
  }

  stop(service: keyof SyncSchedule) {
    const serviceName = service.toString();
    const interval = this.intervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(serviceName);
    }
  }


  stopAll() {
    this.intervals.forEach((interval, service) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }


  private async sync(service: keyof SyncSchedule) {
    try {

      switch (service) {
        case 'github':
          await this.syncGitHub();
          break;
        case 'stripe':
          await this.syncStripe();
          break;
        case 'slack':
          await this.syncSlack();
          break;
        case 'gmail':
          await this.syncGmail();
          break;
        case 'notion':
          await this.syncNotion();
          break;
        case 'bromcom':
          await this.syncBromcom();
          break;
        case 'sparx':
          await this.syncSparx();
          break;
        case 'teams':
          await this.syncTeams();
          break;
      }

      await this.saveLastSyncTime(service);
    } catch (error) {
    }
  }


  private async syncGitHub() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return;
      }

      const identities = user.identities || [];
      const hasGitHub = identities.some((id: { provider: string }) => id.provider === 'github');
      if (!hasGitHub) {
        return;
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('github_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        return;
      }

      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401) {
          return;
        }

        throw new Error(`GitHub sync failed: ${response.statusText} `);
      }

    } catch (error) {
    }
  }


  private async syncStripe() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { data: connection } = await this.supabase
      .from('stripe_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!connection) return;

    const response = await fetch('/api/stripe/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Stripe sync failed: ${response.statusText} `);
    }
  }


  private async syncSlack() {
    const response = await fetch('/api/slack/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Slack sync failed: ${response.statusText} `);
    }
  }


  private async syncGmail() {
    const response = await fetch('/api/gmail/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Gmail sync failed: ${response.statusText} `);
    }
  }


  private async syncNotion() {
    const response = await fetch('/api/notion/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Notion sync failed: ${response.statusText} `);
    }
  }


  private async syncBromcom() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { data: connection } = await this.supabase
      .from('bromcom_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!connection) {
      return;
    }

    const response = await fetch('/api/sync/bromcom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.needsCredentials) {
        return;
      }
      throw new Error(`Bromcom sync failed: ${response.statusText} `);
    }
  }


  private async syncSparx() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { data: connection } = await this.supabase
      .from('sparx_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!connection) {
      return;
    }

    const response = await fetch('/api/sync/sparx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Sparx sync failed: ${response.statusText}`);
    }
  }


  private async syncTeams() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const identities = user.identities || [];
    const hasAzure = identities.some((id: { provider: string }) => id.provider === 'azure');

    if (!hasAzure) {
      return;
    }

    const response = await fetch('/api/sync/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Teams sync failed: ${response.statusText}`);
    }
  }


  private async getLastSyncTime(service: keyof SyncSchedule): Promise<Date | null> {
    try {
      const key = `last_sync_${service} `;
      const timestamp = localStorage.getItem(key);
      return timestamp ? new Date(timestamp) : null;
    } catch {
      return null;
    }
  }


  private async saveLastSyncTime(service: keyof SyncSchedule) {
    const key = `last_sync_${service} `;
    localStorage.setItem(key, new Date().toISOString());
    this.lastSyncs.set(service.toString(), new Date());
  }


  getAllSchedules(): SyncSchedule {
    return { ...DEFAULT_SCHEDULE };
  }


  async getNextSyncTime(service: keyof SyncSchedule): Promise<Date | null> {
    const lastSync = await this.getLastSyncTime(service);
    const hours = DEFAULT_SCHEDULE[service] || 6;
    const interval = hours * 60 * 60 * 1000;

    if (!lastSync) return null;

    return new Date(lastSync.getTime() + interval);
  }
}

export const autoSyncScheduler = new AutoSyncScheduler();
export default autoSyncScheduler;
