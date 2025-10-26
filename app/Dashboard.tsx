import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Bell,
  Calendar,
  Mail,
  MessageSquare,
  Twitter,
  GraduationCap,
  Settings,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
  Home,
  LayoutGrid,
  Zap,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Music,
  FileText,
  ChevronDown,
  ChevronRight,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Brain,
  Star,
  GitPullRequest,
  GitCommit,
  Code,
  ExternalLink,
  Filter,
  Send,
  Users,
  Video,
  Mic,
  Paperclip,
  Hash,
  AtSign,
  Circle,
  Flame,
  Trophy,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";

interface DashboardProps {
  onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

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
                  className="flex items-center gap-2 hover:text-[#FB7C1C] transition-colors"
                >
                  <div className="w-7 h-7 bg-[#FB7C1C] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-base" style={{ fontFamily: "'Instrument Serif', serif" }}>
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Search..." className="pl-8 h-8 text-sm bg-gray-50 border-gray-200" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sidebarExpanded ? (
            <>
              <button
                onClick={() => setActiveSection("overview")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-sm ${
                  activeSection === "overview" ? "bg-orange-50 text-[#FB7C1C]" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveSection("ai")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-sm ${
                  activeSection === "ai" ? "bg-orange-50 text-[#FB7C1C]" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Brain</span>
                <Badge className="ml-auto bg-purple-100 text-purple-700 border-0 text-xs px-1.5 h-4">12</Badge>
              </button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="w-full h-9" onClick={() => setActiveSection("overview")}>
              <Home className="w-4 h-4" />
            </Button>
          )}
        </nav>

        <div className="p-3 border-t border-gray-200">
          {sidebarExpanded ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-full flex items-center justify-center text-white text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">Alex Johnson</p>
                <p className="text-[10px] text-gray-500 truncate">alex@email.com</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-full flex items-center justify-center text-white text-sm mx-auto">
              A
            </div>
          )}
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Good afternoon, Alex
              </h1>
              <p className="text-xs text-gray-500">
                AI managing 13 apps · 8 insights active · Last sync: 2 min ago
              </p>
            </div>
            <div className="flex items-center gap-2">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm">AI Priority Engine</h3>
                    <Badge className="bg-white/20 text-white border-0 text-xs px-2">Live</Badge>
                  </div>
                  <p className="text-xs text-white/90 mb-3">
                    Analyzing 287 items across all apps. I've reorganized your priorities for today based on
                    deadlines, urgency, and cross-app dependencies.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Flame className="w-3 h-3 mr-1" />3 urgent
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <GitPullRequest className="w-3 h-3 mr-1" />2 code reviews
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />5 meetings
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Trophy className="w-3 h-3 mr-1" />94% productivity
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-l-4 border-l-red-500 bg-red-50/50 border-red-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex gap-1.5">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-red-600" />
                          </div>
                          <ArrowDown className="w-3 h-3 text-gray-400 mt-2.5" />
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Github className="w-4 h-4 text-gray-800" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive" className="text-xs h-5">Critical</Badge>
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs h-5">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Connected
                            </Badge>
                            <span className="text-xs text-gray-500">2 min ago</span>
                          </div>
                          <h4 className="text-sm mb-1">
                            Email from <span className="text-gray-900">@sarah.chen</span> about PR review needed
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            "Hey Alex, can you review the authentication PR? It's blocking deployment."
                          </p>
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <GitPullRequest className="w-4 h-4 text-blue-600" />
                              <span className="text-xs">butler-app / #284</span>
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs ml-auto">Open</Badge>
                            </div>
                            <p className="text-xs mb-2">Fix: Update authentication flow</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-green-600">+247 lines</span>
                              <span className="text-red-600">-89 lines</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-600">12 files changed</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-600">3 comments</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button size="sm" className="h-7 text-xs bg-[#FB7C1C] hover:bg-[#e56b0a]">
                              <Code className="w-3 h-3 mr-1" />
                              Review Code
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Send className="w-3 h-3 mr-1" />
                              Reply to Sarah
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 border-blue-200">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <ArrowDown className="w-3 h-3 text-gray-400 mt-2.5" />
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#FB7C1C]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs h-5">In 3 hours</Badge>
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs h-5">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Prepared
                          </Badge>
                        </div>
                        <h4 className="text-sm mb-2">
                          Team Meeting: Q4 Planning at 2:00 PM
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span className="text-xs">Google Meet</span>
                            <span className="text-xs text-gray-500">·</span>
                            <span className="text-xs text-gray-600">1.5 hours</span>
                            <span className="text-xs text-gray-500">·</span>
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">8 attendees</span>
                          </div>
                          <Separator className="my-2" />
                          <p className="text-xs text-gray-600 mb-2">AI suggests preparing:</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-gray-700">Review Notion Q4 goals doc</span>
                              <Badge className="ml-auto bg-green-100 text-green-700 border-0 text-xs">Ready</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-700">Update GitHub project board</span>
                              <Badge className="ml-auto bg-yellow-100 text-yellow-700 border-0 text-xs">5 min</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Circle className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-700">Prepare team metrics from Slack</span>
                              <Badge className="ml-auto bg-yellow-100 text-yellow-700 border-0 text-xs">3 min</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="h-7 text-xs bg-[#FB7C1C] hover:bg-[#e56b0a]">
                            <Zap className="w-3 h-3 mr-1" />
                            Auto-Prepare
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Join Meeting
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
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
                      {[
                        {
                          task: "Complete Math Assignment Chapter 8",
                          due: "Today 5:00 PM",
                          source: { app: "Bromcom", icon: GraduationCap, color: "#FB7C1C" },
                          priority: 1,
                          aiReason: "Due in 3 hours, impacts grade",
                          timeEstimate: "45 min",
                        },
                        {
                          task: "Review PR #284 - Auth flow",
                          due: "Today 6:00 PM",
                          source: { app: "GitHub", icon: Github, color: "#181717" },
                          priority: 2,
                          aiReason: "Blocking deployment, team waiting",
                          timeEstimate: "20 min",
                        },
                        {
                          task: "Reply to Prof. Smith",
                          due: "Tomorrow 9:00 AM",
                          source: { app: "Gmail", icon: Mail, color: "#EA4335" },
                          priority: 3,
                          aiReason: "Assignment feedback available",
                          timeEstimate: "5 min",
                        },
                        {
                          task: "Respond to #design-team",
                          due: "Today",
                          source: { app: "Slack", icon: MessageSquare, color: "#4A154B" },
                          priority: 4,
                          aiReason: "Mockups need approval",
                          timeEstimate: "2 min",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-[#FB7C1C] hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="w-5 h-5 rounded border-2 border-gray-300 hover:border-[#FB7C1C] transition-colors cursor-pointer" />
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center text-xs"
                                style={{ backgroundColor: `${item.source.color}15`, color: item.source.color }}
                              >
                                {item.priority}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm">{item.task}</p>
                                <div
                                  className="w-4 h-4 rounded flex items-center justify-center"
                                  style={{ backgroundColor: `${item.source.color}15` }}
                                >
                                  <item.source.icon className="w-2.5 h-2.5" style={{ color: item.source.color }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{item.due}</span>
                                <span>·</span>
                                <Sparkles className="w-3 h-3 text-purple-500" />
                                <span className="text-purple-600">{item.aiReason}</span>
                                <Badge className="ml-auto bg-gray-200 text-gray-700 border-0 text-xs">
                                  {item.timeEstimate}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm">Social Media Performance</h3>
                        <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          AI Optimized
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">Last 24h</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        {
                          platform: "X",
                          icon: Twitter,
                          color: "#000000",
                          metric: "2.4K",
                          label: "Impressions",
                          change: "+12%",
                          up: true,
                          aiTip: "Best time: 2-4 PM",
                        },
                        {
                          platform: "LinkedIn",
                          icon: Linkedin,
                          color: "#0A66C2",
                          metric: "847",
                          label: "Profile views",
                          change: "+8%",
                          up: true,
                          aiTip: "Post on weekdays",
                        },
                        {
                          platform: "Instagram",
                          icon: Instagram,
                          color: "#E4405F",
                          metric: "124",
                          label: "Engagements",
                          change: "-3%",
                          up: false,
                          aiTip: "Use more reels",
                        },
                        {
                          platform: "YouTube",
                          icon: Youtube,
                          color: "#FF0000",
                          metric: "1.2K",
                          label: "Video views",
                          change: "+24%",
                          up: true,
                          aiTip: "Keep it up!",
                        },
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center"
                              style={{ backgroundColor: `${stat.color}15` }}
                            >
                              <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                            </div>
                            <span className="text-xs text-gray-600">{stat.platform}</span>
                          </div>
                          <div className="text-lg mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            {stat.metric}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">{stat.label}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={stat.up ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                            <Sparkles className="w-3 h-3 text-purple-500" />
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-purple-600">{stat.aiTip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm">Team Communication</h3>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          13 unread
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "#4A154B15" }}>
                          <MessageSquare className="w-2.5 h-2.5" style={{ color: "#4A154B" }} />
                        </div>
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "#6264A715" }}>
                          <MessageSquare className="w-2.5 h-2.5" style={{ color: "#6264A7" }} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          from: "#design-team",
                          message: "New mockups ready for review",
                          app: "Slack",
                          color: "#4A154B",
                          time: "5m",
                          priority: "high",
                        },
                        {
                          from: "Sarah Chen",
                          message: "Can you join the standup?",
                          app: "Teams",
                          color: "#6264A7",
                          time: "15m",
                          priority: "medium",
                        },
                        {
                          from: "#engineering",
                          message: "Deploy scheduled for 6 PM",
                          app: "Slack",
                          color: "#4A154B",
                          time: "1h",
                          priority: "low",
                        },
                      ].map((msg, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: `${msg.color}15`, color: msg.color }}>
                            {msg.from[0] === "#" ? <Hash className="w-3 h-3" /> : <AtSign className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs">{msg.from}</span>
                              <Badge className="text-xs px-1 h-4" style={{ backgroundColor: `${msg.color}15`, color: msg.color, border: 0 }}>
                                {msg.app}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-auto">{msg.time}</span>
                            </div>
                            <p className="text-xs text-gray-600">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="col-span-4 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-[#FB7C1C]" />
                      <h3 className="text-sm">Today's Focus</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Productivity</span>
                          <span className="text-xs text-[#FB7C1C]">94%</span>
                        </div>
                        <Progress value={94} className="h-1.5 mb-2" />
                        <p className="text-xs text-gray-500">+12% from yesterday</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2 border border-orange-200">
                          <div className="text-lg mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>3</div>
                          <p className="text-xs text-gray-600">Due today</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-orange-200">
                          <div className="text-lg mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>2h</div>
                          <p className="text-xs text-gray-600">Saved by AI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm">Today's Schedule</h3>
                      <Badge className="ml-auto bg-blue-100 text-blue-700 border-0 text-xs">5 events</Badge>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 mb-3">
                      <div className="text-center">
                        <div className="text-3xl mb-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>26</div>
                        <div className="text-xs text-gray-600">Sunday, Oct 2025</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { title: "Team Standup", time: "9:00 AM", duration: "30m", color: "#4285F4", prep: "2 items" },
                        { title: "Math Class", time: "2:00 PM", duration: "1.5h", color: "#FB7C1C", prep: "Assignment due" },
                        { title: "Study Session", time: "4:30 PM", duration: "2h", color: "#10B981", prep: "Biology Ch.5" },
                      ].map((event, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
                          <div className="flex-1">
                            <p className="text-xs mb-0.5">{event.title}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                              <span>·</span>
                              <span>{event.duration}</span>
                            </div>
                          </div>
                          {event.prep && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              {event.prep}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-[#FB7C1C]" />
                      <h3 className="text-sm">Bromcom</h3>
                      <Badge className="ml-auto bg-[#FB7C1C] text-white border-0 text-xs">A-</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { subject: "Math", grade: 92, color: "#FB7C1C" },
                        { subject: "Physics", grade: 88, color: "#4285F4" },
                        { subject: "Chemistry", grade: 90, color: "#10B981" },
                      ].map((subject, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-700">{subject.subject}</span>
                            <span className="text-gray-900">{subject.grade}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${subject.grade}%`, backgroundColor: subject.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-red-800 mb-0.5">Due Monday 9 AM</p>
                          <p className="text-xs text-red-600">Chemistry lab report</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Github className="w-4 h-4 text-gray-800" />
                      <h3 className="text-sm">GitHub</h3>
                      <Badge className="ml-auto bg-gray-200 text-gray-700 border-0 text-xs">7 active</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { type: "PR", title: "Auth flow update", changes: "+247 -89", status: "review" },
                        { type: "Issue", title: "Dashboard bug", changes: "", status: "assigned" },
                        { type: "PR", title: "Dark mode", changes: "+156 -23", status: "approved" },
                      ].map((item, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="secondary" className="text-xs px-1.5 h-4">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-gray-900 truncate flex-1">{item.title}</span>
                          </div>
                          {item.changes && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600">{item.changes.split(" ")[0]}</span>
                              <span className="text-red-600">{item.changes.split(" ")[1]}</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-gray-200">
                  <div className="p-4">
                    <h3 className="text-sm mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-1.5">
                        <Plus className="w-3 h-3" />
                        Task
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Event
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-1.5">
                        <Send className="w-3 h-3" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-1.5">
                        <FileText className="w-3 h-3" />
                        Note
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
