
"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { UniversalSyncButton } from "./universal-sync-button";
import { ContextAwareWrapper } from "../ai/context-aware-wrapper";
import { AnalyticsDashboard } from "../payments/analytics-dashboard";
import { PaymentNotificationsPanel } from "../payments/payment-notifications-panel";
import { PaymentNotificationToast } from "../payments/payment-notification-toast";
import { GitHubDashboard } from "../github/github-dashboard";
import { SlackDashboard } from "../slack/slack-dashboard";
import { GmailDashboard } from "../gmail/gmail-dashboard";
import { InsightsPanel } from "../ai/insights-panel";
import { SettingsPage } from "../settings/settings-page";
import { PaymentsConnect } from "../payments/payments-connect";
import { getAssignments, getDashboardStats } from "@/lib/supabase/assignments";
import type { Assignment } from "@/lib/types/assignment";
import { autoSyncScheduler } from "@/lib/auto-sync";
import { BromcomDashboard } from "@/components/bromcom/bromcom-dashboard";
import { NotionDashboard } from "@/components/notion/notion-dashboard";
import { EducationDashboard } from "@/components/education";
import {
  AlertCircle,
  BookOpen,
  Mail,
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  GitBranch,
  GraduationCap,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  LayoutDashboard,
  Settings,
  Command,
  RefreshCw,
  Brain,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Loader2,
  History,
  Target,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  CalendarClock,
  Clock3,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface DashboardProps {
  onBack: () => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "github", label: "GitHub", icon: GitBranch },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "notion", label: "Notion", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Dashboard({ onBack }: DashboardProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string; avatar_url?: string } | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNavItems, setFilteredNavItems] = useState(navItems);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [contextPulse, setContextPulse] = useState(0);
  const [sessionStartTime] = useState(() => Date.now());
  const [isThinking, setIsThinking] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'payment' | 'github' | 'task' | 'general';
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const [hasPayments, setHasPayments] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'lemonsqueezy' | 'polar'>('stripe');

  const [hasGitHub, setHasGitHub] = useState(false);
  const [hasSlack, setHasSlack] = useState(false);
  const [hasGmail, setHasGmail] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    const fetchMemories = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) setMemories(data);
    };
    fetchMemories();
  }, []);

  useEffect(() => {
    let subscription: any = null;

    const setupRealtime = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recentAssignments } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentAssignments) {
        setNotifications(recentAssignments.map((a: any) => ({
          id: a.id,
          type: a.source === 'github' ? 'github' : a.source === 'stripe' ? 'payment' : 'task',
          title: a.source === 'github' ? 'GitHub Issue' : a.source === 'stripe' ? 'Payment' : 'New Task',
          description: a.title,
          timestamp: new Date(a.created_at),
          read: false
        })));
      }

      subscription = supabase
        .channel('assignments_realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'assignments'
        }, (payload: any) => {
          const newItem = payload.new;
          const notification = {
            id: newItem.id,
            type: newItem.source === 'github' ? 'github' as const : newItem.source === 'stripe' ? 'payment' as const : 'task' as const,
            title: newItem.source === 'github' ? 'New GitHub Issue' : newItem.source === 'stripe' ? 'New Payment' : 'New Task',
            description: newItem.title,
            timestamp: new Date(newItem.created_at),
            read: false
          };
          setNotifications(prev => [notification, ...prev.slice(0, 9)]);
          toast(notification.title, { description: notification.description });
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_url: authUser.user_metadata?.avatar_url,
        });

        if (
          authUser.user_metadata?.stripe_api_key ||
          authUser.user_metadata?.lemonsqueezy_api_key ||
          authUser.user_metadata?.polar_api_key
        ) {
          setHasPayments(true);
        }

        const isGitHubConnected = authUser.identities?.some((id: any) => id.provider === 'github');
        let githubProfile: any = null;

        if (isGitHubConnected) {
          setHasGitHub(true);

          const { data } = await supabase
            .from('github_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          githubProfile = data;

          if (!githubProfile) {
            fetch('/api/github/sync', { method: 'POST' }).catch(() => { });
          }
        }

        const isSlackConnected = authUser.identities?.some((id: any) => id.provider === 'slack');
        if (isSlackConnected) {
          setHasSlack(true);
        }

        const isGmailConnected = authUser.identities?.some((id: any) => id.provider === 'google');
        if (isGmailConnected) {
          setHasGmail(true);
        }

        if (isGitHubConnected && githubProfile) {
          autoSyncScheduler.start('github', 4);
        }
        if (hasPayments) {
          autoSyncScheduler.start('stripe', 2);
        }
        if (isSlackConnected) {
          autoSyncScheduler.start('slack', 1);
        }
        if (isGmailConnected) {
          autoSyncScheduler.start('gmail', 3);
        }
      }

      const [assignmentsData, statsData] = await Promise.all([
        getAssignments('pending'),
        getDashboardStats(),
      ]);

      setAssignments(assignmentsData);
      setStats(statsData);
      setGreeting(getGreeting());
    } catch (error: any) {

      if (error.message?.includes('Missing Supabase')) {
        setError('Please configure Supabase in your .env.local file');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const greetingInterval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    const contextInterval = setInterval(() => {
      setContextPulse(prev => prev + 1);
      setIsThinking(true);
      setTimeout(() => setIsThinking(false), 2000);
    }, 30000);

    return () => {
      clearInterval(greetingInterval);
      clearInterval(contextInterval);
      autoSyncScheduler.stopAll();
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNavItems(navItems);
    } else {
      const filtered = navItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNavItems(filtered);
    }
  }, [searchQuery]);

  const handleConnectProvider = (provider: 'stripe' | 'lemonsqueezy' | 'polar') => {
    setSelectedProvider(provider);
    setActiveSection('settings');
  };

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days < 0) return "Overdue";
    if (hours < 24) return `Due in ${hours}h`;
    if (days === 0) return "Due today";
    if (days === 1) return "Tomorrow";
    return date.toLocaleDateString();
  };

  const sortedAssignments = [...assignments]
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    })
    .slice(10);

  const getPersonalizedSubtitle = () => {
    const urgentCount = assignments.filter(a => a.priority === 'high').length;
    const connected = [];
    if (hasPayments) connected.push('payments');
    if (hasGitHub) connected.push('GitHub');

    if (connected.length === 0) {
      return "Connect your first integration to get started";
    }
    if (urgentCount > 0) {
      return `${urgentCount} urgent item${urgentCount > 1 ? 's' : ''} need${urgentCount === 1 ? 's' : ''} attention`;
    }
    return `Managing ${connected.join(', ')} • Everything looks good`;
  };

  const getPriorityItems = () => {
    const items = [];

    assignments.filter(a => a.priority === 'high' || new Date(a.due_date || '') < new Date()).slice(0, 2).forEach(assignment => {
      const hoursUntilDue = assignment.due_date ? Math.floor((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60)) : null;
      const isOverdue = hoursUntilDue !== null && hoursUntilDue < 0;

      items.push({
        title: assignment.title,
        subtitle: assignment.subject || assignment.source || '',
        icon: assignment.source === 'notion' ? <FileText className="w-4 h-4 text-blue-600" /> :
          assignment.source === 'github' ? <GitBranch className="w-4 h-4 text-indigo-600" /> :
            <FileText className="w-4 h-4 text-purple-600" />,
        badge: isOverdue ? 'Due' : hoursUntilDue !== null ? `${Math.abs(hoursUntilDue)}h` : 'No due',
        priority: 'high',
        action: () => {
        }
      });
    });

    if (items.length === 0 && hasGitHub && stats?.github?.openIssues > 0) {
      items.push({
        title: 'GitHub Issues',
        subtitle: 'Needs attention',
        icon: <GitBranch className="w-4 h-4 text-blue-600" />,
        badge: `${stats?.github?.openIssues} open`,
        priority: 'medium',
        action: () => setActiveSection('github')
      });
    }

    if (items.length === 0 && hasPayments && stats?.total_revenue > 0) {
      items.push({
        title: 'Revenue Update',
        subtitle: 'This period',
        icon: <CreditCard className="w-4 h-4 text-orange-600" />,
        badge: `$${(stats?.total_revenue / 100).toFixed(0)}`,
        priority: 'low',
        action: () => setActiveSection('payments')
      });
    }

    return items;
  };

  const getDynamicInsight = () => {
    const connected = [];
    if (hasPayments) connected.push('payments');
    if (hasGitHub) connected.push('GitHub');
    if (hasSlack) connected.push('Slack');
    if (hasGmail) connected.push('Gmail');

    if (connected.length === 0) {
      const hour = new Date().getHours();
      return contextPulse % 4 === 0
        ? hour < 12 ? "Good morning! Let's set up your workspace together. I'm here to help you stay organized." : hour < 17 ? "Good afternoon! Ready to optimize your workflow? Let's connect your first integration." : "Good evening! Let's get your workspace ready for tomorrow."
        : contextPulse % 4 === 1
          ? "I see we haven't connected any tools yet. I'm excited to help you manage your work once you add your first integration!"
          : contextPulse % 4 === 2
            ? "Your dashboard is ready and waiting. Connect GitHub, payments, or your favorite tools and I'll start learning your patterns."
            : "Think of me as your assistant. The more you connect, the better I can help you stay on top of everything.";
    }

    const urgentCount = assignments.filter(a => a.priority === 'high').length;
    const dueSoonCount = assignments.filter(a => {
      if (!a.due_date) return false;
      const hours = Math.floor((new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      return hours > 0 && hours < 24;
    }).length;

    const patterns = [
      urgentCount > 0 && `Hey, I noticed you have ${urgentCount} urgent item${urgentCount > 1 ? 's' : ''} that need${urgentCount === 1 ? 's' : ''} attention. Let's tackle these first - I've got your back! 💪`,
      dueSoonCount > 0 && `${dueSoonCount} item${dueSoonCount > 1 ? 's' : ''} due soon! Want me to help you prioritize? I can suggest what to focus on.`,
      hasPayments && stats?.total_revenue > 0 && `Great news - your revenue is at $${(stats.total_revenue / 100).toFixed(2)}${contextPulse % 5 === 0 ? '! 🎉' : '.'} ${contextPulse % 3 === 0 ? "I'm tracking patterns to help you grow even more." : contextPulse % 3 === 1 ? 'Your customers are happy. Keep it up!' : 'Let me know if you want deeper insights into your revenue trends.'}`,
      hasGitHub && stats?.github?.openIssues > 0 && `I've been watching your GitHub - ${stats.github.openIssues} issue${stats.github.openIssues > 1 ? 's' : ''} waiting${contextPulse % 2 === 0 ? '. Some look quick to fix!' : '. Want me to analyze which ones to tackle first?'}`,
      connected.length > 0 && `I've been monitoring ${connected.join(', ')}. ${contextPulse % 3 === 0 ? 'Everything looks smooth from here! 👌' : contextPulse % 3 === 1 ? 'Your workflow is running beautifully.' : "I'm here if you need anything."}`,
      assignments.length > 5 && `We're managing ${assignments.length} items together. ${contextPulse % 2 === 0 ? "I'll keep everything organized for you." : 'Your productivity is looking great!'}`,
      contextPulse % 5 === 0 && sessionMinutes > 60 && `We've been working together for ${sessionMinutes} minutes now. Need a break, or should we keep going? 😊`,
      contextPulse % 7 === 0 && `Last time I checked: ${new Date().toLocaleTimeString()}. Your data syncs automatically, so you're always up to date.`,
    ].filter(Boolean);

    const randomIndex = contextPulse % patterns.length;
    return patterns[randomIndex] || `Your workspace is all set! Managing ${connected.join(' and ')}${contextPulse % 3 === 0 ? ' like a pro!' : contextPulse % 3 === 1 ? ' beautifully.' : '.'}`;
  };

  const urgentCount = assignments.filter(a => a.priority === 'high').length;
  const dueSoonCount = assignments.filter(a => {
    if (!a.due_date) return false;
    const hours = Math.floor((new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60));
    return hours > 0 && hours < 24;
  }).length;
  const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
  const connected = [
    ...(hasPayments ? ['payments'] : []),
    ...(hasGitHub ? ['GitHub'] : []),
    ...(hasSlack ? ['Slack'] : []),
    ...(hasGmail ? ['Gmail'] : [])
  ];

  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
      <motion.aside
        className="bg-[#0A0A0A] border-r border-white/10 flex flex-col z-20"
        initial={{ width: 260 }}
        animate={{ width: sidebarExpanded ? 260 : 80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`p-5 flex items-center ${sidebarExpanded ? "justify-between gap-3" : "justify-center"}`}>
          <div className={`flex items-center ${sidebarExpanded ? "gap-3 overflow-hidden justify-start" : "justify-center"}`}>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <motion.div
              animate={{ width: sidebarExpanded ? "auto" : 0, opacity: sidebarExpanded ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <span className="text-lg text-white tracking-tight font-serif whitespace-nowrap">
                Butler
              </span>
            </motion.div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            <motion.div
              animate={{ rotate: sidebarExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>

        {sidebarExpanded && (
          <div className="px-4 mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
              <Input
                placeholder="Search tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm bg-white/5 border-transparent hover:bg-white/10 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-xl transition-all placeholder:text-neutral-500 text-neutral-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] text-neutral-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-medium" title="Framework shortcut">⌘F</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeSection === item.id
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeSection === item.id ? "text-orange-500" : "text-neutral-500 group-hover:text-neutral-300"}`} />
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {('badge' in item && typeof item.badge === 'number' && item.badge > 0) && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeSection === item.id
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-neutral-400"
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-white/5 ${!sidebarExpanded && "justify-center"}`}
              >
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {sidebarExpanded && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-neutral-200 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email || 'No email'}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-64 p-2 rounded-2xl border-white/10 bg-[#111111] shadow-2xl shadow-black/50 text-neutral-200">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-neutral-500">{user?.email || 'No email linked'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setActiveSection("settings")}
                className="gap-3 text-sm text-neutral-400 focus:bg-white/10 focus:text-white rounded-xl cursor-pointer px-3 py-2.5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={onBack}
                className="gap-3 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300 rounded-xl cursor-pointer px-3 py-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFDFD]">
        {error && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-2">
            <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <p>
                {error}
                {error.includes('Supabase') && (
                  <a href="/COMPLETE_SETUP.md" target="_blank" className="ml-1 underline hover:text-red-800">
                    View setup guide
                  </a>
                )}
              </p>
            </div>
          </div>
        )}

        <header className="bg-[#FDFDFD]/80 backdrop-blur-xl border-b border-neutral-100 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
                {activeSection === "overview" ? (
                  <>
                    {greeting}, {user?.name?.split(' ')[0] || 'there'}
                    <span className="text-xl">👋</span>
                  </>
                ) : activeSection === "settings" ? (
                  "Settings"
                ) : (
                  navItems.find(i => i.id === activeSection)?.label
                )}
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {activeSection === "overview" ? (
                  loading ? "Syncing your digital life framework..." : "Your unified framework for productivity."
                ) : activeSection === "settings" ? (
                  "Manage your account and integrations"
                ) : (
                  "Manage your " + activeSection
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <UniversalSyncButton onSyncComplete={fetchData} />

              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
                onClick={() => setShowActions(!showActions)}
              >
                <Command className="w-3.5 h-3.5" />
                Actions
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
              </Button>
            </div>
          </div>
        </header>

        <div className="relative">
          {showActions && (
            <div className="absolute right-4 top-0 z-50 w-80 bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-black/5 overflow-hidden">
              <div className="p-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">Quick Actions</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Manage your account and integrations</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setActiveSection("settings");
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-neutral-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Open Settings</p>
                    <p className="text-xs text-neutral-500">Manage integrations and preferences</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    fetchData();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <RefreshCw className="w-4 h-4 text-neutral-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Refresh Data</p>
                    <p className="text-xs text-neutral-500">Sync all connected integrations</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-neutral-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Clear Search</p>
                    <p className="text-xs text-neutral-500">Reset all filters and searches</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {showNotifications && (
            <div className="absolute right-4 top-0 z-50 w-96 bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-black/5 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 text-[10px] font-medium px-2 py-0.5">
                  {notifications.filter(n => !n.read).length} new
                </Badge>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No notifications yet</p>
                    <p className="text-xs mt-1">New items will appear here in real-time</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const iconConfig = {
                      payment: { bg: 'bg-orange-100', icon: <CreditCard className="w-4 h-4 text-orange-600" /> },
                      github: { bg: 'bg-blue-100', icon: <GitBranch className="w-4 h-4 text-blue-600" /> },
                      task: { bg: 'bg-purple-100', icon: <GraduationCap className="w-4 h-4 text-purple-600" /> },
                      general: { bg: 'bg-neutral-100', icon: <Bell className="w-4 h-4 text-neutral-600" /> }
                    };
                    const { bg, icon } = iconConfig[notif.type] || iconConfig.general;
                    const timeAgo = getTimeAgo(notif.timestamp);

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900">{notif.title}</p>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">{notif.description} • {timeAgo}</p>
                          </div>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="p-4 text-center border-t border-neutral-50">
                  <button
                    className="text-xs text-neutral-500 hover:text-orange-600 transition-colors"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <PaymentNotificationToast />

          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {activeSection === "payments" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                {hasPayments ? (
                  <>
                    <AnalyticsDashboard />
                    <PaymentNotificationsPanel />
                  </>
                ) : (
                  <PaymentsConnect onConnect={handleConnectProvider} />
                )}
              </motion.div>
            ) : activeSection === "github" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <GitHubDashboard />
              </motion.div>
            ) : activeSection === "slack" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SlackDashboard />
              </motion.div>
            ) : activeSection === "gmail" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <GmailDashboard />
              </motion.div>
            ) : activeSection === "education" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <EducationDashboard />
              </motion.div>
            ) : activeSection === "notion" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <NotionDashboard />
              </motion.div>
            ) : activeSection === "settings" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                <SettingsPage initialProvider={selectedProvider} />
              </motion.div>
            ) : (
              <div className="p-6">
                { }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">

                  { }
                  <motion.div
                    className="col-span-1 md:col-span-2 rounded-3xl bg-white border border-neutral-100 shadow-sm p-6 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Sparkles className="w-32 h-32 text-purple-500 rotate-12" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                          <Bot className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-neutral-900">
                            {greeting}, {user?.name?.split(' ')[0] || 'there'}!
                          </h2>
                          <p className="text-xs text-neutral-500">Your AI Copilot is ready.</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50/50 to-white/50 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 mb-4">
                        <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                          {isThinking ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                            </span>
                          ) : (
                            getDynamicInsight() || "I'm analyzing your workspace to find the best next steps for you."
                          )}
                        </p>
                      </div>

                      { }
                      {getPriorityItems().length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {getPriorityItems().slice(0, 3).map((item, i) => (
                            <button
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 border border-neutral-200 hover:border-purple-300 rounded-full text-xs font-medium text-neutral-700 hover:text-purple-700 transition-all cursor-pointer shadow-sm"
                              onClick={() => item.action && item.action()}
                            >
                              <span className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
                              <span className="truncate max-w-[100px]">{item.title}</span>
                              <ArrowRight className="w-3 h-3 opacity-50" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  { }
                  <motion.div
                    className="col-span-1 rounded-3xl bg-white border border-neutral-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                    onClick={() => setActiveSection('payments')}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10" />
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      {hasPayments && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                          +12%
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-neutral-500 font-medium mb-1">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        ${stats?.total_revenue ? (stats.total_revenue / 100).toLocaleString() : "0"}
                      </h3>
                    </div>
                  </motion.div>

                  { }
                  <motion.div
                    className="col-span-1 rounded-3xl bg-white border border-neutral-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                    onClick={() => setActiveSection('github')}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10" />
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-white" />
                      </div>
                      {hasGitHub && stats?.github?.openIssues > 0 && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {stats.github.openIssues} open
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-neutral-500 font-medium mb-1">Active Issues</p>
                      <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        {stats?.github?.openIssues || 0}
                      </h3>
                    </div>
                  </motion.div>

                  { }
                  <motion.div
                    className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl bg-white border border-neutral-100 shadow-sm overflow-hidden p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <InsightsPanel />
                  </motion.div>

                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
