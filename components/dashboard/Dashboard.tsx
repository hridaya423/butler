/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UniversalSyncButton } from "./universal-sync-button";
import { NotionSyncButton } from "./notion-sync-button";
import { InsightsPanel } from "../ai/insights-panel";
import { AnalyticsDashboard } from "../payments/analytics-dashboard";
import { PaymentNotificationsPanel } from "../payments/payment-notifications-panel";
import { PaymentNotificationToast } from "../payments/payment-notification-toast";
import { GitHubDashboard } from "../github/github-dashboard";
import { SlackDashboard } from "../slack/slack-dashboard";
import { GmailDashboard } from "../gmail/gmail-dashboard";
import { SettingsPage } from "../settings/settings-page";
import { PaymentsConnect } from "../payments/payments-connect";
import { getAssignments, getDashboardStats, updateAssignment } from "@/lib/supabase/assignments";
import type { Assignment } from "@/lib/types/assignment";
import {
  AlertCircle,
  Bell,
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  GitBranch,
  GraduationCap,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Search,
  UserCircle,
  LayoutDashboard,
  Settings,
  Command,
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

export function Dashboard({ onBack }: DashboardProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string; avatar_url?: string } | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [error, setError] = useState<string | null>(null);

  const [hasPayments, setHasPayments] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'lemonsqueezy' | 'polar'>('stripe');

  const [hasGitHub, setHasGitHub] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

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

        if (isGitHubConnected) {
          setHasGitHub(true);

          const { data: githubProfile } = await supabase
            .from('github_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          if (!githubProfile) {
            fetch('/api/github/sync', { method: 'POST' }).catch(console.error);
          }
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
      console.error('Error fetching data:', error);

      if (error.message?.includes('Missing Supabase')) {
        setError('Please configure Supabase in your .env.local file');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "ai", label: "AI Insights", icon: Brain, badge: stats?.pending },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "github", label: "GitHub", icon: GitBranch }
  ];

  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
      <motion.aside
        className="bg-[#0A0A0A] border-r border-white/10 flex flex-col z-20"
        initial={{ width: 260 }}
        animate={{ width: sidebarExpanded ? 260 : 80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg text-white tracking-tight font-serif"
              >
                Butler
              </motion.span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            {sidebarExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
          </Button>
        </div>

        {sidebarExpanded && (
          <div className="px-4 mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
              <Input
                placeholder="Search..."
                className="pl-9 h-10 text-sm bg-white/5 border-transparent hover:bg-white/10 focus:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-xl transition-all placeholder:text-neutral-500 text-neutral-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] text-neutral-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-medium" title="Framework shortcut">⌘F</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {navItems.map((item) => (
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
                  {item.badge && item.badge > 0 && (
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
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setActiveSection("settings")}
                className="gap-3 text-sm text-neutral-400 focus:bg-white/10 focus:text-white rounded-xl cursor-pointer px-3 py-2.5 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
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
              <NotionSyncButton onSyncComplete={fetchData} />
              <div className="h-6 w-px bg-neutral-200 mx-1" />
              <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm">
                <Command className="w-3.5 h-3.5" />
                Actions
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
              </Button>
            </div>
          </div>
        </header>

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
            ) : activeSection === "ai" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <InsightsPanel />
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hasPayments && (
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CreditCard className="w-5 h-5 text-orange-600" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-neutral-400 hover:text-neutral-900" onClick={() => setActiveSection("payments")}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-neutral-500 font-medium">Total Revenue</p>
                      <h3 className="text-2xl font-semibold text-neutral-900 mt-1 tracking-tight">
                        {stats?.total_revenue ? `$${(stats.total_revenue / 100).toFixed(2)}` : "—"}
                      </h3>
                    </div>
                  )}

                  {hasGitHub && (
                    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <GitBranch className="w-5 h-5 text-blue-600" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-neutral-400 hover:text-neutral-900" onClick={() => setActiveSection("github")}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500 font-medium">Open Issues</p>
                          <h3 className="text-2xl font-semibold text-neutral-900 mt-1 tracking-tight">
                            {stats?.github?.openIssues || 0}
                          </h3>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 font-medium">Merged PRs</p>
                          <h3 className="text-2xl font-semibold text-neutral-900 mt-1 tracking-tight">
                            {stats?.github?.mergedPRs || 0}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-neutral-400 hover:text-neutral-900" onClick={() => setActiveSection("ai")}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-neutral-500 font-medium">Pending Insights</p>
                    <h3 className="text-2xl font-semibold text-neutral-900 mt-1 tracking-tight">
                      {stats?.pending || 0}
                    </h3>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ease: "easeOut" }}
                >
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">Unified Inbox</h3>
                        <Badge className="bg-neutral-100 text-neutral-600 border-0 text-[10px] font-medium px-2 py-0.5 shadow-none">
                          AI-sorted
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium gap-1.5 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        Add Item
                      </Button>
                    </div>

                    <div className="divide-y divide-neutral-50">
                      {sortedAssignments.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-5 h-5 text-neutral-300" />
                          </div>
                          <p className="text-sm font-medium text-neutral-900 mb-1">No messages yet</p>
                          <p className="text-xs text-neutral-500">Connect your integrations to see them here.</p>
                        </div>
                      ) : (
                        sortedAssignments.map((assignment, i) => (
                          <div
                            key={assignment.id}
                            className="group p-4 hover:bg-neutral-50/50 transition-all duration-200 flex items-start gap-4 cursor-pointer"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${assignment.source === "bromcom" ? "bg-white border-neutral-100" :
                              assignment.source === "notion" ? "bg-white border-neutral-100" : "bg-white border-neutral-100"
                              }`}>
                              {assignment.source === "bromcom" ? (
                                <GraduationCap className="w-5 h-5 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                              ) : assignment.source === "notion" ? (
                                <FileText className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                              ) : (
                                <GitBranch className="w-5 h-5 text-neutral-400 group-hover:text-indigo-500 transition-colors" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors">{assignment.title}</p>
                                  {assignment.priority === "high" && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-orange-100" title="High Priority" />
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-400 font-medium tabular-nums bg-neutral-50 px-1.5 py-0.5 rounded-md">
                                  {formatDueDate(assignment.due_date)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span className="font-medium text-neutral-400 capitalize">
                                  {assignment.source || "Unknown"}
                                </span>
                                {assignment.subject && (
                                  <>
                                    <span className="text-neutral-300">•</span>
                                    <span className="truncate">{assignment.subject}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-neutral-400 hover:text-orange-600 hover:bg-orange-50 -mr-2">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
