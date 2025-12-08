'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Brain, Lock, Eye, AlertCircle, CheckCircle2, Info, Zap } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function AISafetySettings() {
  const [settings, setSettings] = useState({
    github: true,
    stripe: true,
    slack: true,
    gmail: true,
    notion: true,
    assignments: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_data_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('ai_data_settings', JSON.stringify(settings));
      toast('AI data settings saved successfully', {
        description: 'Your preferences have been updated and will take effect immediately.',
        icon: '✅',
      });
    } catch (error) {
      toast('Failed to save settings', {
        description: 'Please try again.',
        icon: '❌',
      });
    } finally {
      setSaving(false);
    }
  };

  const allEnabled = Object.values(settings).every(Boolean);
  const someDisabled = Object.values(settings).some(v => !v) && !allEnabled;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
        <div className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
        <div className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <Lock className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-neutral-900">AI Data Control</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Control what data the AI assistant can access to generate insights and recommendations.
          </p>
          <div className="flex items-center gap-2 mt-3">
            {allEnabled ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                All data sources enabled
              </Badge>
            ) : someDisabled ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-[10px] font-medium">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Object.values(settings).filter(v => !v).length} sources disabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] font-medium">
                <AlertCircle className="w-3 h-3 mr-1" />
                AI features disabled
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Integration Data
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">GitHub Activity</p>
                  <p className="text-xs text-neutral-500">Issues, PRs, repositories, and activity data</p>
                </div>
              </div>
              <Switch
                checked={settings.github}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, github: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Payments & Revenue</p>
                  <p className="text-xs text-neutral-500">Transaction data, revenue, customer info</p>
                </div>
              </div>
              <Switch
                checked={settings.stripe}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, stripe: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Slack Messages</p>
                  <p className="text-xs text-neutral-500">Channel activity and messages</p>
                </div>
              </div>
              <Switch
                checked={settings.slack}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, slack: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Gmail & Email</p>
                  <p className="text-xs text-neutral-500">Email threads and conversations</p>
                </div>
              </div>
              <Switch
                checked={settings.gmail}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, gmail: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Notion & Assignments</p>
                  <p className="text-xs text-neutral-500">Tasks, notes, and workspace data</p>
                </div>
              </div>
              <Switch
                checked={settings.notion}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notion: checked }))}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            Core Application Data
          </h4>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Assignments & Tasks</p>
                  <p className="text-xs text-neutral-500">Your todo items, priorities, and deadlines</p>
                </div>
              </div>
              <Switch
                checked={settings.assignments}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, assignments: checked }))}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2 ml-12">
              When disabled, AI will provide generic insights without personalized context
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500">
            Changes take effect immediately
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <Shield className="w-4 h-4" />
                </motion.div>
                Saving...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
