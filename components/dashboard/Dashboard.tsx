/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SyncButton } from "./sync-button";
import { NotionSyncButton } from "./notion-sync-button";
import { InsightsPanel } from "../ai/insights-panel";
import { getAssignments, getDashboardStats, updateAssignment } from "@/lib/supabase/assignments";
import type { Assignment } from "@/lib/types/assignment";
import {
  AlertCircle,
  Bell,
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  GitBranch,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  UserCircle,
  UserCog,
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

interface DashboardProps {
  onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [error, setError] = useState<string | null>(null);

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
        });
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

  const handleStatusUpdate = async (id: string, status: 'pending' | 'completed' | 'archived') => {
    try {
      await updateAssignment(id, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
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
    .slice(0, 10);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <motion.aside
        className="bg-white border-r border-neutral-100 flex flex-col"
        initial={{ width: 260 }}
        animate={{ width: sidebarExpanded ? 260 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            {sidebarExpanded ? (
              <>
                <button
                  onClick={onBack}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-orange-50 hover:text-orange-500 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-semibold text-neutral-900 tracking-tight">
                    Butler
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-400 hover:text-neutral-900"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mx-auto text-neutral-400 hover:text-neutral-900"
                onClick={() => setSidebarExpanded(true)}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {sidebarExpanded && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 text-sm bg-white border-neutral-200 rounded-lg focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarExpanded ? (
            <>
              <button
                onClick={() => setActiveSection("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${activeSection === "overview" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveSection("ai")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${activeSection === "ai" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Insights</span>
                {stats && stats.pending > 0 && (
                  <Badge className="ml-auto bg-neutral-100 text-neutral-600 border-0 text-xs px-1.5 h-4 font-medium">
                    {stats.pending}
                  </Badge>
                )}
              </button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="w-full h-9 text-neutral-500 hover:text-neutral-900" onClick={() => setActiveSection("overview")}>
              <Home className="w-4 h-4" />
            </Button>
          )}
        </nav>

        <div className="p-3 border-t border-neutral-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {sidebarExpanded ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:bg-neutral-50"
                >
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm truncate font-medium text-neutral-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email || 'No email linked'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 text-sm font-medium mx-auto transition-transform hover:scale-105"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-56 bg-white border border-neutral-100 shadow-xl shadow-neutral-200/50 rounded-xl p-2">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-neutral-900">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-neutral-500">{user?.email || 'No email linked'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100 my-1" />
              <DropdownMenuItem className="gap-2 text-sm text-neutral-600 focus:bg-neutral-50 focus:text-neutral-900 rounded-lg cursor-pointer px-2 py-2">
                <UserCircle className="w-4 h-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm text-neutral-600 focus:bg-neutral-50 focus:text-neutral-900 rounded-lg cursor-pointer px-2 py-2">
                <UserCog className="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-100 my-1" />
              <DropdownMenuItem
                onClick={onBack}
                className="gap-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg cursor-pointer px-2 py-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {error && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-3">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>
                {error}
                {error.includes('Supabase') && (
                  <a href="/COMPLETE_SETUP.md" target="_blank" className="ml-1 underline font-medium hover:text-red-800">
                    View setup guide
                  </a>
                )}
              </p>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-neutral-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                {greeting}, {user?.name || 'there'}
              </h1>
              <p className="text-sm text-neutral-500">
                {loading ? (
                  "Loading your dashboard..."
                ) : stats && stats.total > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {stats.total} messages • {stats.dueToday || 0} need attention
                  </span>
                ) : (
                  "No messages yet. Connect your integrations to get started!"
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SyncButton onSyncComplete={fetchData} />
              <NotionSyncButton onSyncComplete={fetchData} />
              <div className="h-6 w-px bg-neutral-200 mx-1" />
              <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <InsightsPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: "easeOut" }}
            >
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">Unified Inbox</h3>
                    <Badge className="bg-neutral-100 text-neutral-600 border-0 text-[10px] font-medium px-2 py-0.5">
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
                        className="group p-4 hover:bg-neutral-50/50 transition-all duration-200 flex items-start gap-4"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${assignment.source === "bromcom" ? "bg-white border-neutral-100" :
                          assignment.source === "notion" ? "bg-white border-neutral-100" : "bg-white border-neutral-100"
                          }`}>
                          {assignment.source === "bromcom" ? (
                            <GraduationCap className="w-4 h-4 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                          ) : assignment.source === "notion" ? (
                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                          ) : (
                            <GitBranch className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500 transition-colors" />
                          )}
                        </div>


                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-neutral-900 group-hover:text-orange-600 transition-colors">{assignment.title}</p>
                              {assignment.priority === "high" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="High Priority" />
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium tabular-nums">
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

                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-orange-600 hover:bg-orange-50">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
