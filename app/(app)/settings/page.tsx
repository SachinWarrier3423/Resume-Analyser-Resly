"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import GlassCard from "@/components/GlassCard";
import AnimatedButton from "@/components/AnimatedButton";
import { motion } from "framer-motion";
import { User, Bell, Download, Trash2, Save } from "lucide-react";
import { UserProfile } from "@/types";

// Mock user data
const mockUser: UserProfile = {
  name: "John Doe",
  email: "john@example.com",
  preferences: {
    aiModel: "standard",
    exportFormat: "pdf",
    notifications: true,
  },
};

export default function SettingsPage() {
  const [user, setUser] = useState(mockUser);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
    }, 1000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-light text-neutral-900 mb-2">
            Settings
          </h1>
          <p className="text-neutral-600 font-light">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile */}
        <GlassCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-neutral-600" />
              <h2 className="text-xl font-medium text-neutral-900">
                Profile
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) =>
                    setUser({ ...user, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm font-light text-neutral-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm font-light text-neutral-900 transition-all"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* AI Preferences */}
        <GlassCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-neutral-600" />
              <h2 className="text-xl font-medium text-neutral-900">
                AI Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  AI Model
                </label>
                <select
                  value={user.preferences.aiModel}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        aiModel: e.target.value as "standard" | "advanced",
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm font-light text-neutral-900 transition-all"
                >
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Export Format
                </label>
                <select
                  value={user.preferences.exportFormat}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        exportFormat: e.target.value as "pdf" | "docx" | "json",
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm font-light text-neutral-900 transition-all"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Notifications
                  </label>
                  <p className="text-xs text-neutral-500 font-light">
                    Receive updates about your analyses
                  </p>
                </div>
                <button
                  onClick={() =>
                    setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        notifications: !user.preferences.notifications,
                      },
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    user.preferences.notifications
                      ? "bg-accent-500"
                      : "bg-neutral-300"
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{
                      x: user.preferences.notifications ? 24 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Data Management */}
        <GlassCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-neutral-600" />
              <h2 className="text-xl font-medium text-neutral-900">
                Data Management
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Export All Data
                  </p>
                  <p className="text-xs text-neutral-500 font-light mt-1">
                    Download all your analyses and data
                  </p>
                </div>
                <AnimatedButton variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </AnimatedButton>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Delete All Data
                  </p>
                  <p className="text-xs text-red-600 font-light mt-1">
                    Permanently delete all your analyses and account data
                  </p>
                </div>
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </AnimatedButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <AnimatedButton
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </AnimatedButton>
        </div>
      </div>
    </AppShell>
  );
}

