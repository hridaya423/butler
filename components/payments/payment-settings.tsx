'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Check,
  DollarSign,
  Palette,
  Bell,
  FileText,
  Mail,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface PaymentSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyWebsite: string;

  invoicePrefix: string;
  taxRate: number;
  currency: string;
  defaultNotes: string;

  emailNotifications: boolean;
  dashboardNotifications: boolean;
  notificationSound: boolean;

  accentColor: string;
  dateFormat: string;
  timezone: string;
}

export function PaymentSettingsPanel() {
  const [settings, setSettings] = useState<PaymentSettings>({
    companyName: 'Your Company Name',
    companyEmail: 'billing@yourcompany.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Street',
    companyCity: 'City, State 12345',
    companyWebsite: 'www.yourcompany.com',
    invoicePrefix: 'INV',
    taxRate: 0,
    currency: 'USD',
    defaultNotes: 'Thank you for your business!',
    emailNotifications: true,
    dashboardNotifications: true,
    notificationSound: false,
    accentColor: '#FB7C1C',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('payment_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultSettings: PaymentSettings = {
      companyName: 'Your Company Name',
      companyEmail: 'billing@yourcompany.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 Business Street',
      companyCity: 'City, State 12345',
      companyWebsite: 'www.yourcompany.com',
      invoicePrefix: 'INV',
      taxRate: 0,
      currency: 'USD',
      defaultNotes: 'Thank you for your business!',
      emailNotifications: true,
      dashboardNotifications: true,
      notificationSound: false,
      accentColor: '#FB7C1C',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'America/New_York',
    };
    setSettings(defaultSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl font-semibold text-neutral-900 tracking-tight mb-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Payment Settings
          </h2>
          <p className="text-base text-neutral-500 font-light">
            Customize your payment experience and invoice templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="hover:bg-neutral-50 transition-all duration-300"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 bg-neutral-900 text-white hover:bg-black transition-all duration-300"
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="border-orange-100 shadow-sm rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3
              className="text-xl font-semibold text-neutral-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Company Information
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              Appears on invoices and receipts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-neutral-700">
              Company Name *
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail" className="text-sm font-medium text-neutral-700">
              Email Address *
            </Label>
            <Input
              id="companyEmail"
              type="email"
              value={settings.companyEmail}
              onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone" className="text-sm font-medium text-neutral-700">
              Phone Number
            </Label>
            <Input
              id="companyPhone"
              value={settings.companyPhone}
              onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="text-sm font-medium text-neutral-700">
              Website
            </Label>
            <Input
              id="companyWebsite"
              value={settings.companyWebsite}
              onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="text-sm font-medium text-neutral-700">
              Street Address
            </Label>
            <Input
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyCity" className="text-sm font-medium text-neutral-700">
              City, State ZIP
            </Label>
            <Input
              id="companyCity"
              value={settings.companyCity}
              onChange={(e) => setSettings({ ...settings, companyCity: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
            />
          </div>
        </div>
      </Card>

      <Card className="border-orange-100 shadow-sm rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3
              className="text-xl font-semibold text-neutral-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Invoice Settings
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              Configure invoice defaults and formatting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix" className="text-sm font-medium text-neutral-700">
              Invoice Number Prefix
            </Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
              className="bg-neutral-50 border-neutral-100"
              placeholder="INV"
            />
            <p className="text-xs text-neutral-500">Example: INV-20250122-ABC123</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium text-neutral-700">
              Currency
            </Label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-100 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate" className="text-sm font-medium text-neutral-700">
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
              }
              className="bg-neutral-50 border-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat" className="text-sm font-medium text-neutral-700">
              Date Format
            </Label>
            <select
              id="dateFormat"
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-100 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defaultNotes" className="text-sm font-medium text-neutral-700">
              Default Invoice Notes
            </Label>
            <textarea
              id="defaultNotes"
              value={settings.defaultNotes}
              onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-100 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-light"
              placeholder="Thank you for your business!"
            />
          </div>
        </div>
      </Card>

      <Card className="border-orange-100 shadow-sm rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3
              className="text-xl font-semibold text-neutral-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Notification Preferences
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-orange-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Email Notifications</p>
                <p className="text-xs text-neutral-500">Receive emails for new payments</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, emailNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-orange-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Dashboard Notifications</p>
                <p className="text-xs text-neutral-500">Show toast notifications in dashboard</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.dashboardNotifications}
              onChange={(e) =>
                setSettings({ ...settings, dashboardNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-orange-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔔</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Sound Alerts</p>
                <p className="text-xs text-neutral-500">Play sound when payments are received</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSound}
              onChange={(e) =>
                setSettings({ ...settings, notificationSound: e.target.checked })
              }
              className="w-5 h-5 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
            />
          </label>
        </div>
      </Card>

      <Card className="border-orange-100 shadow-sm rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3
              className="text-xl font-semibold text-neutral-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Display Settings
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              Customize the look and feel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accentColor" className="text-sm font-medium text-neutral-700">
              Accent Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-16 h-10 p-1 bg-neutral-50 border-neutral-100"
              />
              <Input
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 bg-neutral-50 border-neutral-100"
                placeholder="#FB7C1C"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-neutral-700">
              Timezone
            </Label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-100 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </Card>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 p-4 rounded-xl bg-green-50 border border-green-200 shadow-xl flex items-center gap-3 z-50"
        >
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Settings Saved!</p>
            <p className="text-xs text-green-700">Your preferences have been updated</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
