'use client'

import { useState } from 'react'
import { Lock, Bell, Shield, Eye, HelpCircle, LogOut, ChevronRight, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'help', label: 'Help', icon: '❓' },
  ]

  const notificationSettings = [
    { name: 'Work Opportunities', enabled: true, desc: 'Get notified about new job listings' },
    { name: 'Score Updates', enabled: true, desc: 'Alerts when your score changes' },
    { name: 'Finance Products', enabled: true, desc: 'New financial offers available' },
    { name: 'Community', enabled: false, desc: 'Updates from the community' },
    { name: 'Marketing', enabled: false, desc: 'Promotional emails and offers' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-trace-border overflow-hidden sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 font-medium transition border-b border-trace-border/50 last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-trace-primary text-white'
                      : 'text-foreground hover:bg-trace-surface'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="flex-1 text-left">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={18} />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-trace-border p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Profile Information</h2>
                    <p className="text-muted-foreground">Manage your personal and business information</p>
                  </div>
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? 'default' : 'outline'}
                    className={editMode ? 'bg-trace-primary' : ''}
                  >
                    {editMode ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Profile Section */}
                <div className="space-y-8">
                  {/* Avatar */}
                  <div>
                    <h3 className="font-bold text-foreground mb-4">Profile Photo</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-trace-primary to-trace-primary/80 rounded-full flex items-center justify-center text-white text-3xl">
                        JD
                      </div>
                      <button className="px-6 py-3 bg-trace-primary text-white rounded-lg font-bold hover:bg-trace-primary/90 transition flex items-center gap-2">
                        <Upload size={18} /> Upload Photo
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-trace-border pt-8">
                    <h3 className="font-bold text-foreground mb-6">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                        <Input defaultValue="John" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                        <Input defaultValue="Doe" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Email</label>
                        <Input type="email" defaultValue="john@example.com" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Phone</label>
                        <Input defaultValue="+234 901 234 5678" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-trace-border pt-8">
                    <h3 className="font-bold text-foreground mb-6">Business Information</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-foreground mb-2">Business Name</label>
                        <Input defaultValue="John's Trading Co." disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Business Category</label>
                        <Input defaultValue="Retail/Reselling" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Primary Location</label>
                        <Input defaultValue="Lagos, Nigeria" disabled={!editMode} className="bg-trace-surface border-trace-border" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg border border-trace-border p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Security Settings</h2>
                  <p className="text-muted-foreground">Manage your password and security preferences</p>
                </div>

                <div className="border-t border-trace-border pt-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Password</h3>
                      <p className="text-sm text-muted-foreground">Change your password regularly to keep your account secure</p>
                    </div>
                    <button className="px-4 py-2 bg-trace-primary text-white rounded-lg font-bold hover:bg-trace-primary/90 transition">
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-trace-border pt-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 border border-trace-primary text-trace-primary rounded-lg font-bold hover:bg-trace-primary/5 transition">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="border-t border-trace-border pt-8">
                  <h3 className="font-bold text-foreground mb-6">Active Sessions</h3>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome on Windows', location: 'Lagos, Nigeria', time: 'Current session' },
                      { device: 'Safari on iPhone', location: 'Lagos, Nigeria', time: '2 days ago' },
                    ].map((session, idx) => (
                      <div key={idx} className="flex items-start justify-between p-4 bg-trace-surface rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{session.device}</p>
                          <p className="text-sm text-muted-foreground">{session.location} • {session.time}</p>
                        </div>
                        <button className="text-sm text-red-600 font-bold hover:underline">Sign Out</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-trace-border p-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
                  <p className="text-muted-foreground mb-8">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  {notificationSettings.map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-trace-border/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{setting.name}</p>
                        <p className="text-sm text-muted-foreground">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-trace-border peer-checked:bg-trace-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg border border-trace-border p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Privacy Settings</h2>
                  <p className="text-muted-foreground">Control how your information is used and shared</p>
                </div>

                <div className="border-t border-trace-border pt-8 space-y-4">
                  {[
                    { title: 'Profile Visibility', desc: 'Control who can see your profile' },
                    { title: 'Data Collection', desc: 'Manage how your data is collected and used' },
                    { title: 'Third-party Access', desc: 'Control which apps can access your Trace account' },
                    { title: 'Download Your Data', desc: 'Download a copy of all your personal data' },
                  ].map((privacy, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 bg-trace-surface rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{privacy.title}</p>
                        <p className="text-sm text-muted-foreground">{privacy.desc}</p>
                      </div>
                      <button className="text-trace-primary font-bold hover:underline whitespace-nowrap">Manage</button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-trace-border pt-8">
                  <button className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition">
                    Delete Account
                  </button>
                  <p className="text-xs text-muted-foreground mt-3">This action cannot be undone</p>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="bg-white rounded-lg border border-trace-border p-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Help & Support</h2>
                  <p className="text-muted-foreground mb-8">Get help with your Trace account</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Documentation', desc: 'Read our comprehensive guides and tutorials', icon: '📚' },
                    { title: 'Contact Support', desc: 'Get help from our support team', icon: '💬' },
                    { title: 'Report a Bug', desc: 'Report technical issues or bugs', icon: '🐛' },
                    { title: 'Community Forum', desc: 'Connect with other Trace users', icon: '👥' },
                    { title: 'Video Tutorials', desc: 'Watch step-by-step video guides', icon: '🎥' },
                    { title: 'FAQ', desc: 'Find answers to common questions', icon: '❓' },
                  ].map((help, idx) => (
                    <button key={idx} className="w-full flex items-start justify-between p-4 border border-trace-border/50 rounded-lg hover:border-trace-primary/50 transition text-left">
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <span className="text-xl">{help.icon}</span>
                          {help.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{help.desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


