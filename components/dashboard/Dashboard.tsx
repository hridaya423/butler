/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Home,
  LogOut,
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <motion.aside
        className="bg-white border-r border-gray-200 flex flex-col"
        initial={{ width: 260 }}
        animate={{ width: sidebarExpanded ? 260 : 72 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarExpanded ? (
              <>
                <button
                  onClick={onBack}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-orange-50 hover:text-[#FB7C1C] transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-xl flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Butler
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mx-auto"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-[#FB7C1C]/30"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sidebarExpanded ? (
            <>
              <button
                onClick={() => setActiveSection("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  activeSection === "overview" ? "bg-orange-50 text-[#FB7C1C]" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveSection("ai")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  activeSection === "ai" ? "bg-orange-50 text-[#FB7C1C]" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Insights</span>
                {stats && stats.pending > 0 && (
                  <Badge className="ml-auto bg-purple-100 text-purple-700 border-0 text-xs px-1.5 h-4">
                    {stats.pending}
                  </Badge>
                )}
              </button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="w-full h-9" onClick={() => setActiveSection("overview")}>
              <Home className="w-4 h-4" />
            </Button>
          )}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {sidebarExpanded ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm truncate font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'No email linked'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-9 h-9 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-semibold mx-auto transition-transform hover:scale-105"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-48">
              <DropdownMenuItem className="gap-2 text-sm">
                <UserCircle className="w-4 h-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm">
                <UserCog className="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onBack}
                className="gap-2 text-sm text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>
                {error}
                {error.includes('Supabase') && (
                  <a href="/COMPLETE_SETUP.md" target="_blank" className="ml-1 underline font-medium">
                    View setup guide
                  </a>
                )}
              </p>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {greeting}, {user?.name || 'there'}
              </h1>
              <p className="text-xs text-gray-500">
                {loading ? (
                  "Loading your dashboard..."
                ) : stats && stats.total > 0 ? (
                  `${stats.total} assignments • ${stats.dueToday || 0} due today • ${stats.highPriority || 0} high priority`
                ) : (
                  "No assignments yet. Click 'Sync Bromcom' to get started!"
                )}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Heads up: this sprint build was capped at six hours—Notion sync is the only live integration and we use your API key in-memory for each sync.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SyncButton onSyncComplete={fetchData} />
              <NotionSyncButton onSyncComplete={fetchData} />
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-4">
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
                transition={{ delay: 0.4 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm">AI-Prioritized Tasks</h3>
                        <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                          Auto-sorted by urgency
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {sortedAssignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm mb-2">No assignments yet!</p>
                          <p className="text-xs">Click the Sync button above to fetch your homework from Bromcom.</p>
                        </div>
                      ) : (
                        sortedAssignments.map((assignment, i) => (
                          <div
                            key={assignment.id}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-[#FB7C1C] hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 mt-0.5">
                                <div
                                  className="w-5 h-5 rounded border-2 border-gray-300 hover:border-[#FB7C1C] transition-colors cursor-pointer"
                                  onClick={() => handleStatusUpdate(assignment.id, "completed")}
                                />
                                <Badge
                                  variant={assignment.priority === "high" ? "destructive" : assignment.priority === "medium" ? "default" : "secondary"}
                                  className="text-xs h-5 px-1.5"
                                >
                                  {assignment.priority}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm">{assignment.title}</p>
                                  {assignment.source === "bromcom" && (
                                    <div
                                      className="w-4 h-4 rounded flex items-center justify-center"
                                      style={{ backgroundColor: "#FB7C1C15" }}
                                    >
                                      <GraduationCap className="w-2.5 h-2.5" style={{ color: "#FB7C1C" }} />
                                    </div>
                                  )}
                                  {assignment.source === "notion" && (
                                    <div
                                      className="w-4 h-4 rounded flex items-center justify-center"
                                      style={{ backgroundColor: "#00000015" }}
                                    >
                                      <FileText className="w-2.5 h-2.5" style={{ color: "#000000" }} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDueDate(assignment.due_date)}</span>
                                  {assignment.subject && (
                                    <>
                                      <span>·</span>
                                      <span>{assignment.subject}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
