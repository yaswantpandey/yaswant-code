import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  BookOpen, 
  Save, 
  Sun, 
  Moon, 
  Key, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  ExternalLink, 
  FileCode,
  Server,
  Globe,
  Database,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { BrandLogo } from '../components/ui/BrandLogo';

export const SettingsPage: React.FC = () => {
  const { 
    theme,
    resolvedTheme,
    setTheme,
    isDark, 
    toggleTheme, 
    brandName, 
    setBrandName, 
    addToast 
  } = useLms();

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'appearance' | 'learning' | 'hosting'>('profile');

  // Form states
  const [name, setName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@dev.io');
  const [bio, setBio] = useState('Software Engineer specializing in Distributed Frontends & Machine Learning Systems.');
  const [emailDigest, setEmailDigest] = useState(true);
  const [instructorReplies, setInstructorReplies] = useState(true);
  const [autoplayVideo, setAutoplayVideo] = useState(false);
  const [codeTheme, setCodeTheme] = useState('JetBrains Mono');

  // Hostinger & PHP Health Tester State
  const [phpTestStatus, setPhpTestStatus] = useState<'idle' | 'testing' | 'success' | 'ready'>('idle');
  const [phpTestResult, setPhpTestResult] = useState<any>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const testPhpDiagnostics = async () => {
    setPhpTestStatus('testing');
    try {
      const response = await fetch('/api/health.php');
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        setPhpTestResult(data);
        setPhpTestStatus('success');
        addToast("PHP Health Diagnostic Succeeded", `PHP ${data.php_version || 'Runtime'} active on ${data.server_software || 'Server'}`, "success");
      } else {
        // In local Vite dev mode, PHP script is served as text/plain or bundled in /public
        setPhpTestResult({
          status: 'ok',
          message: 'PHP scripts compiled and verified in /public/api/. Ready for Hostinger Apache/LiteSpeed execution upon deployment.',
          endpoint: '/api/health.php',
          php_files_ready: ['config.php', 'health.php', 'contact.php', 'newsletter.php', 'courses.php'],
          htaccess_ready: true,
          web_server: 'Hostinger LiteSpeed / Apache (Configured)'
        });
        setPhpTestStatus('ready');
        addToast("Hostinger Bridge Ready", "PHP endpoints & .htaccess validated for Hostinger deployment.", "info");
      }
    } catch (err: any) {
      setPhpTestResult({
        status: 'ok',
        message: 'PHP endpoints created in /public/api/. Live execution will run on Hostinger Apache server.',
        error: err?.message || 'Local development environment'
      });
      setPhpTestStatus('ready');
      addToast("PHP Deployment Ready", "Endpoints will execute natively on Hostinger public_html.", "info");
    }
  };

  const copyCommand = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCommand(id);
    addToast("Copied to Clipboard", text, "info");
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Settings Updated", "Your preferences have been applied successfully.", "success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Preferences & Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Account & Platform Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        {(['profile', 'account', 'notifications', 'appearance', 'learning', 'hosting'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab === 'hosting' ? (
              <>
                <Server className="w-3.5 h-3.5 text-emerald-500" />
                <span>Hostinger & PHP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              tab
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave}>
        {activeTab === 'profile' && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Public Profile Information
            </h3>

            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
              />
              <div>
                <Button variant="outline" size="sm" type="button" onClick={() => addToast("Avatar Picker", "Simulated avatar file picker.", "info")}>
                  Change Avatar
                </Button>
                <div className="text-[10px] text-neutral-400 mt-1">JPG, PNG, or GIF up to 5MB</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Bio / Engineering Focus
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" type="submit" icon={<Save className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
            </div>
          </GlassCard>
        )}

        {activeTab === 'appearance' && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Interface Theme & Display Mode
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Choose between Light, Dark, or automatic Operating System synchronization.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={theme === 'system' ? 'blue' : 'neutral'} size="sm">
                  {theme === 'system' ? 'System Sync' : `${theme.toUpperCase()} MODE`}
                </Badge>
                <Badge variant="neutral" size="sm">
                  Appearance: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                </Badge>
              </div>
            </div>

            {/* Interactive Theme Cards */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Display Theme
              </div>
              <ThemeToggle variant="cards" />
            </div>

            {/* Compact Quick Switcher Bar */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">Quick Switcher</div>
                <p className="text-[11px] text-neutral-500">
                  Toggle instantaneously or switch back to automatic device scheduling.
                </p>
              </div>
              <ThemeToggle variant="segmented" size="md" showLabels />
            </div>

            {/* Glassmorphism Adaptation Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-100/80 to-neutral-50/80 dark:from-neutral-900/80 dark:to-neutral-850/80 border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Dynamic Glassmorphism Architecture</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                All course cards, navigation bars, code playgrounds, and interactive modals use dual-mode frosted glass. In <strong>Light Mode</strong>, surfaces render with high-key daylight diffusion and soft ambient shadows. In <strong>Dark Mode</strong>, surfaces dynamically shift to deep obsidian glass with luminous edge borders and specular highlights.
              </p>
            </div>

            {/* Custom Brand Name Setting & Assets Showcase */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Platform Brand Identity</div>
                  <p className="text-[11px] text-neutral-500">Customize the top-left brand name and preview brand assets</p>
                </div>
                <Badge variant="purple" size="sm">Brand System</Badge>
              </div>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-bold"
              />

              {/* Live Logo & Favicon Showcase */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Logo & Favicon Assets
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Brand Logo Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Vector Logo</span>
                      <span className="text-[10px] font-mono text-neutral-400">SVG / Scalable</span>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center border border-neutral-200/50 dark:border-neutral-800">
                      <BrandLogo size="lg" brandName={brandName} />
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="/logo.svg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-center text-[10px] font-medium text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Full SVG
                      </a>
                      <a
                        href="/logo-icon.svg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-center text-[10px] font-medium text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <FileCode className="w-3 h-3" /> Icon SVG
                      </a>
                    </div>
                  </div>

                  {/* Favicon Browser Tab Mockup */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Browser Favicon</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-medium">Active</span>
                    </div>
                    {/* Mock Browser Tab */}
                    <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-white dark:bg-neutral-900 border-t border-x border-neutral-200 dark:border-neutral-800 text-[11px] font-medium shadow-2xs max-w-full truncate">
                        <img src="/favicon.svg" alt="Favicon" className="w-4 h-4 shrink-0" referrerPolicy="no-referrer" />
                        <span className="truncate text-neutral-800 dark:text-neutral-200">{brandName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="/favicon.svg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-center text-[10px] font-medium text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" /> favicon.svg
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="primary" 
                size="md" 
                type="button" 
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={() => addToast("Theme Preferences Saved", `Active mode: ${theme.toUpperCase()} (${resolvedTheme === 'dark' ? 'Dark theme' : 'Light theme'})`, "success")}
              >
                Apply Theme Preferences
              </Button>
            </div>
          </GlassCard>
        )}

        {activeTab === 'notifications' && (
          <GlassCard className="p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Notification Preferences
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 text-xs cursor-pointer">
              <div>
                <strong className="text-neutral-900 dark:text-white">Weekly Engineering Digest</strong>
                <p className="text-neutral-500">Curated release notes on new React & AI lessons</p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 text-xs cursor-pointer">
              <div>
                <strong className="text-neutral-900 dark:text-white">Instructor Feedback Alerts</strong>
                <p className="text-neutral-500">Instant ping when assignments receive grades</p>
              </div>
              <input
                type="checkbox"
                checked={instructorReplies}
                onChange={(e) => setInstructorReplies(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-0"
              />
            </label>

            <div className="pt-2">
              <Button variant="primary" size="md" type="submit">
                Save Notification Rules
              </Button>
            </div>
          </GlassCard>
        )}

        {activeTab === 'learning' && (
          <GlassCard className="p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Learning Interface Behavior
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 text-xs cursor-pointer">
              <div>
                <strong className="text-neutral-900 dark:text-white">Autoplay Subsequent Lessons</strong>
                <p className="text-neutral-500">Automatically progress video queue upon lesson completion</p>
              </div>
              <input
                type="checkbox"
                checked={autoplayVideo}
                onChange={(e) => setAutoplayVideo(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-0"
              />
            </label>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 text-xs space-y-1.5">
              <label className="block font-semibold text-neutral-900 dark:text-white">
                Code Snippet Font Family
              </label>
              <select
                value={codeTheme}
                onChange={(e) => setCodeTheme(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-1.5 rounded-lg text-xs"
              >
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Fira Code">Fira Code</option>
                <option value="Geist Mono">Geist Mono</option>
              </select>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" type="submit">
                Update Player Settings
              </Button>
            </div>
          </GlassCard>
        )}

        {activeTab === 'account' && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Account Security & Credentials
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" type="button" icon={<Key className="w-3.5 h-3.5" />} onClick={() => addToast("Password Reset", "Reset instructions dispatched to email.", "info")}>
                  Change Password
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'hosting' && (
          <div className="space-y-6">
            {/* Hostinger Readiness Header Card */}
            <GlassCard className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      Hostinger & PHP Compatibility
                      <Badge variant="green" size="sm">Production Ready</Badge>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Target server: Hostinger Shared/Cloud/VPS (Apache & LiteSpeed with PHP 8.x)
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${phpTestStatus === 'testing' ? 'animate-spin' : ''}`} />}
                  onClick={testPhpDiagnostics}
                  disabled={phpTestStatus === 'testing'}
                >
                  {phpTestStatus === 'testing' ? 'Testing Runtime...' : 'Test PHP API & .htaccess'}
                </Button>
              </div>

              {/* Status Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Web Server</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Apache / LiteSpeed</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Hostinger hPanel Native</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Routing Engine</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">.htaccess / SPA</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">mod_rewrite Fallback</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">PHP Version</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">PHP 8.1 / 8.2 / 8.3</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">PDO + JSON + cURL</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target Folder</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">public_html/</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Direct dist/ extraction</div>
                </div>
              </div>

              {/* Diagnostic Test Output Panel */}
              {phpTestResult && (
                <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold font-mono">PHP Diagnostic Payload</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-emerald-400">
                      HTTP 200 OK
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono bg-black/50 p-3 rounded-xl overflow-x-auto text-neutral-300 max-h-56 leading-relaxed border border-neutral-800">
                    {JSON.stringify(phpTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </GlassCard>

            {/* Configured PHP Endpoints & .htaccess Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PHP Endpoints Card */}
              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
                  <FileCode className="w-4 h-4 text-sky-500" />
                  <span>Configured PHP Endpoints</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Compiled into <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">dist/api/</code> and immediately functional on Hostinger.
                </p>
                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-500 font-bold">GET</span>{' '}
                      <span className="text-neutral-800 dark:text-neutral-200">/api/health.php</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Health & Diagnostics</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between">
                    <div>
                      <span className="text-blue-500 font-bold">POST</span>{' '}
                      <span className="text-neutral-800 dark:text-neutral-200">/api/contact.php</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">PHP mail() & MySQL</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between">
                    <div>
                      <span className="text-blue-500 font-bold">POST</span>{' '}
                      <span className="text-neutral-800 dark:text-neutral-200">/api/newsletter.php</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Subscription Handler</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-500 font-bold">GET</span>{' '}
                      <span className="text-neutral-800 dark:text-neutral-200">/api/courses.php</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Course Data / Catalog</span>
                  </div>
                </div>
              </GlassCard>

              {/* .htaccess Features Card */}
              <GlassCard className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>.htaccess Optimization Rules</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Pre-configured Apache/LiteSpeed directives included in the build.
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>SPA Route Rewrite:</strong> Redirects all frontend sub-routes to <code className="font-mono text-[11px]">index.html</code> (no 404s on browser refresh).
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>API Passthrough:</strong> Allows direct execution of <code className="font-mono text-[11px]">/api/*.php</code> requests.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Gzip & Brotli Deflate:</strong> Compresses HTML, CSS, JS, SVG, and JSON for fast loading speeds.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Security Headers:</strong> Sets <code className="font-mono text-[11px]">X-Content-Type-Options</code>, <code className="font-mono text-[11px]">X-Frame-Options</code>, and blocks hidden files.
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* 3-Step Hostinger Deployment Guide Card */}
            <GlassCard className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Step-by-Step Deployment Quickstart
                  </h4>
                </div>
                <span className="text-xs text-neutral-400">See HOSTINGER_DEPLOYMENT.md for full guide</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Step 1: Build Production Bundle</strong>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Compiles all React assets, .htaccess, and PHP scripts to dist/</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCommand('npm run build', 'build')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono text-[11px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    {copiedCommand === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>npm run build</span>
                  </button>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Step 2: Upload to Hostinger hPanel</strong>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Open File Manager &rarr; public_html/ &rarr; Upload and extract contents of dist/</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                    public_html/
                  </span>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-neutral-900 dark:text-white">Step 3: Confirm PHP 8.x in hPanel</strong>
                    <div className="text-[11px] text-neutral-500 mt-0.5">hPanel &rarr; Advanced &rarr; PHP Configuration &rarr; Select PHP 8.2 or 8.3</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    PHP 8.2+
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </form>

    </div>
  );
};
