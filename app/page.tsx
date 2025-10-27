'use client'
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles, Calendar, Mail, MessageSquare, Twitter, GraduationCap, Bell, Zap, Clock, Users, LayoutGrid, Star, Play, Github } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPage({ onGetStarted }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const integrations = [
    { name: 'Gmail', icon: Mail, color: '#EA4335' },
    { name: 'Slack', icon: MessageSquare, color: '#4A154B' },
    { name: 'Teams', icon: MessageSquare, color: '#6264A7' },
    { name: 'X', icon: Twitter, color: '#000000' },
    { name: 'Calendar', icon: Calendar, color: '#4285F4' },
    { name: 'Bromcom', icon: GraduationCap, color: '#FB7C1C' },
  ];

  const features = [
    {
      title: 'Unified Dashboard',
      description: 'All your apps in one place. No more context switching between tabs.',
      icon: LayoutGrid,
    },
    {
      title: 'Smart Notifications',
      description: 'AI-powered filtering shows you only what matters. Cut the noise by 85%.',
      icon: Bell,
    },
    {
      title: 'Never Miss Deadlines',
      description: 'Automatic tracking across all your platforms. Stay on top of everything.',
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] overflow-hidden">
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-gray-200/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FB7C1C] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>Butler</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-[#FB7C1C] transition-colors">Features</a>
            <a href="#integrations" className="text-sm font-medium text-gray-700 hover:text-[#FB7C1C] transition-colors">Integrations</a>
            <a href="https://github.com" className="text-gray-700 hover:text-[#FB7C1C] transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
          </div>
           <Button 
            onClick={onGetStarted}
            className="bg-[#FB7C1C] hover:bg-[#e56b0a] text-white"
          >
            Get Started
          </Button>
        </div>
      </motion.nav>

      <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-b from-orange-50/20 to-[#FAF9F6]">
        <motion.div 
          className="max-w-6xl mx-auto"
          style={{ y }}
        >
          <div className="text-center max-w-4xl mx-auto mb-16">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl mb-6 text-gray-900 tracking-tight leading-[1.15] font-bold"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Your life runs better when
              <br />
              everything <span className="text-[#FB7C1C]">connects.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto font-normal"
            >
              Butler brings Slack, Gmail, Teams, and your school portal into one unified dashboard. Never miss what matters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center"
            >
               <Button 
            onClick={onGetStarted}
            className="bg-[#FB7C1C] hover:bg-[#e56b0a] text-white"
          >
            Get Started
          </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="paper-texture rounded-2xl shadow-2xl p-8 dither-effect border border-gray-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FB7C1C] to-orange-400 rounded-lg" />
                    <span className="text-sm text-gray-700">Butler Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>12</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">Unread emails</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>3</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">Tasks due today</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>5</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">Upcoming events</div>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 flex items-center gap-3"
                  >
                    <div className="w-4 h-4 rounded border-2 border-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">Complete math assignment</div>
                      <div className="text-xs text-gray-500">Due in 3 hours</div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">High</Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 flex items-center gap-3"
                  >
                    <div className="w-4 h-4 rounded border-2 border-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">Team meeting prep</div>
                      <div className="text-xs text-gray-500">Tomorrow at 10 AM</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Medium</Badge>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 3 }}
                animate={{ opacity: 1, x: 0, rotate: 2 }}
                transition={{ delay: 1.3, type: "spring" }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-64 hidden lg:block"
              >
                <div className="paper-texture rounded-xl p-4 shadow-xl border border-gray-200 dither-effect" style={{ transform: 'rotate(2deg)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-900 mb-1">AI Assistant</div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        &quot;I&apos;ve prioritized your tasks for today based on deadlines.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="#FB7C1C" />
          </svg>
        </div>
        <div className="absolute top-1/4 right-0 w-48 h-48 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect x="50" y="50" width="100" height="100" fill="#4285F4" rx="20" />
          </svg>
        </div>
      </section>

      <section id="features" className="py-32 bg-[#FAF9F6] relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span 
              className="text-2xl text-[#FB7C1C] block mb-4"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Built for productivity
            </span>
            <h2 className="text-5xl md:text-6xl mb-6 text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Butler brings all your tools together in one seamless workspace
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6">
                  <feature.icon className="w-8 h-8 text-[#FB7C1C]" />
                </div>
                <h3 className="text-2xl mb-4 text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          />
        </div>
      </section>

      <section id="integrations" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="text-2xl text-[#FB7C1C] block mb-4"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Connect everything
            </span>
            <h2 className="text-5xl md:text-6xl mb-6 text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Integrates with
              <br />
              your favorite apps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly connect with the tools you already use every day
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#FB7C1C] hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center aspect-square"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${integration.color}15` }}
                >
                  <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
                </div>
                <span className="text-sm text-gray-700 text-center">{integration.name}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-4">And many more...</p>
            <Button variant="secondary">
              Request an Integration
            </Button>
          </motion.div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-[#FB7C1C]" />
          <div className="absolute top-40 right-32 w-2 h-2 rounded-full bg-blue-500" />
          <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-purple-500" />
          <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full bg-green-500" />
        </div>
      </section>

      <section className="pt-32 pb-12 bg-[#FAF9F6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle, #FB7C1C 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-gray-900 font-bold" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Start organizing <span className="text-[#FB7C1C]">today.</span>
            </h2>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
              Free and open source. Set up in minutes.
            </p>

            <div className="flex items-center justify-center">
              <Button 
            onClick={onGetStarted}
            className="bg-[#FB7C1C] hover:bg-[#e56b0a] text-white"
          >
            Get Started
          </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none dither-effect">
          <div className="w-full h-full bg-gradient-to-br from-[#FB7C1C] to-orange-300 rounded-full blur-3xl" />
        </div>
      </section>

      <footer className="bg-[#FAF9F6] border-t border-gray-200">
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#FB7C1C] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>Butler</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-xs">
                  Your all-in-one productivity dashboard. Connect your life, never miss a deadline.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-400 hover:text-[#FB7C1C] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-[#FB7C1C] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-[#FB7C1C] transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-[#FB7C1C] transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="mb-4 text-sm text-gray-900">Product</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><a href="#features" className="hover:text-[#FB7C1C] transition-colors">Features</a></li>
                  <li><a href="#integrations" className="hover:text-[#FB7C1C] transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Roadmap</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm text-gray-900">Company</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Press Kit</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm text-gray-900">Resources</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Guides</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">API Docs</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Status</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm text-gray-900">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-[#FB7C1C] transition-colors">GDPR</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  © 2025 Butler, Inc. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <a href="#" className="hover:text-[#FB7C1C] transition-colors">System Status</a>
                  <span>·</span>
                  <a href="#" className="hover:text-[#FB7C1C] transition-colors">Sitemap</a>
                  <span>·</span>
                  <div className="flex items-center gap-2">
                    <span>Made with</span>
                    <span className="text-red-500">❤️</span>
                    <span>for productivity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/auth';
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
}
