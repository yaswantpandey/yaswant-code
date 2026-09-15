import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Wrench, 
  Code, 
  Terminal, 
  Key, 
  Clock, 
  Palette, 
  Hash, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Button } from '../components/ui/Button';

type ToolTab = 'formatter' | 'regex' | 'jwt' | 'cron' | 'contrast' | 'uuid';

export const ToolsPage: React.FC = () => {
  const { addToast } = useLms();
  const [activeTab, setActiveTab] = useState<ToolTab>('formatter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label = 'Copied to clipboard!') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      addToast(label, text.length > 40 ? text.substring(0, 40) + '...' : text, 'info');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // --------------------------------------------------------------------------
  // 1. CODE & JSON FORMATTER STATE
  // --------------------------------------------------------------------------
  const [formatterInput, setFormatterInput] = useState<string>(
    JSON.stringify({
      course: "Distributed Raft Consensus",
      instructor: "Marcus Thorne",
      studentsCount: 14200,
      activeNodes: ["node-alpha", "node-beta", "node-gamma"],
      config: { quorum: 3, heartbeatMs: 150, logCompaction: true }
    }, null, 2)
  );
  const [formatterType, setFormatterType] = useState<'json' | 'sql'>('json');
  const [formatterError, setFormatterError] = useState<string | null>(null);
  const [formattedOutput, setFormattedOutput] = useState<string>('');

  const handleFormatJson = (minify = false) => {
    try {
      setFormatterError(null);
      const parsed = JSON.parse(formatterInput);
      const res = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setFormattedOutput(res);
      addToast(minify ? 'JSON minified!' : 'JSON formatted cleanly!', `${res.length} bytes`, 'success');
    } catch (err: any) {
      setFormatterError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleFormatSql = (minify = false) => {
    setFormatterError(null);
    if (!formatterInput.trim()) return;
    if (minify) {
      setFormattedOutput(formatterInput.replace(/\s+/g, ' ').trim());
    } else {
      // Clean indentation for common SQL keywords
      const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET'];
      let formatted = formatterInput;
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${kw}`);
      });
      setFormattedOutput(formatted.trim());
    }
    addToast('SQL processed!', '', 'success');
  };

  // --------------------------------------------------------------------------
  // 2. REGEX TESTER STATE
  // --------------------------------------------------------------------------
  const [regexPattern, setRegexPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState<{ g: boolean; i: boolean; m: boolean }>({ g: true, i: true, m: false });
  const [regexTestString, setRegexTestString] = useState<string>(
    'Contact the engineering team at dev@yaswantcode.io or reach out to marcus.architect@cloud.net for infrastructure inquiries.'
  );

  const regexResults = useMemo(() => {
    if (!regexPattern) return { valid: true, matches: [], error: null };
    try {
      const flags = `${regexFlags.g ? 'g' : ''}${regexFlags.i ? 'i' : ''}${regexFlags.m ? 'm' : ''}`;
      const re = new RegExp(regexPattern, flags);
      const matches: { text: string; index: number; groups?: string[] }[] = [];
      let m;
      if (regexFlags.g) {
        while ((m = re.exec(regexTestString)) !== null) {
          matches.push({ text: m[0], index: m.index, groups: m.slice(1) });
          if (re.lastIndex === m.index) re.lastIndex++; // prevent infinite loops
        }
      } else {
        m = re.exec(regexTestString);
        if (m) matches.push({ text: m[0], index: m.index, groups: m.slice(1) });
      }
      return { valid: true, matches, error: null };
    } catch (e: any) {
      return { valid: false, matches: [], error: e.message };
    }
  }, [regexPattern, regexFlags, regexTestString]);

  const loadRegexPreset = (preset: 'email' | 'url' | 'semver' | 'uuid') => {
    if (preset === 'email') {
      setRegexPattern('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
      setRegexTestString('Reach us at support@yaswantcode.com or team@deepmind.com');
    } else if (preset === 'url') {
      setRegexPattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)');
      setRegexTestString('Visit https://ai.studio or http://localhost:3000/api for preview');
    } else if (preset === 'semver') {
      setRegexPattern('v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?');
      setRegexTestString('Upgraded from v1.4.2 to v2.0.0-rc.1 for React 19 testing');
    } else if (preset === 'uuid') {
      setRegexPattern('[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}');
      setRegexTestString('Transaction id is 4f7c10d3-5591-46ab-8422-7711f42a981c in session');
    }
  };

  // --------------------------------------------------------------------------
  // 3. JWT TOKEN INSPECTOR STATE
  // --------------------------------------------------------------------------
  const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTE0MjAiLCJuYW1lIjoiQWxleCBNZXJjZXIiLCJyb2xlIjoic3R1ZGVudCIsImNvdXJzZXMiOlsicmFmdC1zeXN0ZW1zIiwicmVhY3QtMTkiXSwiaWF0IjoxNzI2MzA4MDAwLCJleHAiOjE3NTc4NDQwMDB9.sampleSignaturePartForValidation123";
  const [jwtInput, setJwtInput] = useState<string>(SAMPLE_JWT);

  const decodedJwt = useMemo(() => {
    if (!jwtInput.trim()) return null;
    const parts = jwtInput.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format: A valid token must have 3 segments separated by dots (header.payload.signature).' };
    }
    try {
      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return JSON.parse(atob(base64));
      };
      const header = decodeBase64Url(parts[0]);
      const payload = decodeBase64Url(parts[1]);
      const signature = parts[2];

      let expStatus = 'No expiration claim found';
      let isExpired = false;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        isExpired = expDate < now;
        expStatus = isExpired
          ? `Expired on ${expDate.toLocaleString()}`
          : `Valid (Expires ${expDate.toLocaleString()})`;
      }

      return { header, payload, signature, expStatus, isExpired, error: null };
    } catch (e: any) {
      return { error: `Failed to decode JWT: ${e.message}` };
    }
  }, [jwtInput]);

  // --------------------------------------------------------------------------
  // 4. CRON EXPRESSION PARSER STATE
  // --------------------------------------------------------------------------
  const [cronInput, setCronInput] = useState<string>('*/15 * * * *');

  const cronExplanation = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, text: 'Must contain 5 fields: minute hour day-of-month month day-of-week', runs: [] };
    }

    const [min, hour, dom, month, dow] = parts;
    let desc = '';

    if (min === '*' && hour === '*') desc = 'Runs every single minute';
    else if (min.startsWith('*/')) desc = `Runs every ${min.replace('*/', '')} minutes`;
    else if (min === '0' && hour === '*') desc = 'Runs every hour at minute 0';
    else if (min === '0' && hour === '0') desc = 'Runs once every day at midnight (00:00)';
    else if (min === '0' && hour === '2') desc = 'Runs daily at 02:00 AM';
    else desc = `Scheduled at: Min(${min}) Hour(${hour}) Day(${dom}) Month(${month}) Weekday(${dow})`;

    // Generate 5 next run approximations
    const runs: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(now.getTime() + i * 15 * 60 * 1000);
      runs.push(nextDate.toLocaleString());
    }

    return { valid: true, text: desc, runs };
  }, [cronInput]);

  // --------------------------------------------------------------------------
  // 5. COLOR CONTRAST (WCAG) STATE
  // --------------------------------------------------------------------------
  const [fgColor, setFgColor] = useState<string>('#FFFFFF');
  const [bgColor, setBgColor] = useState<string>('#0A0A0A');

  const contrastResult = useMemo(() => {
    const getLuminance = (hex: string) => {
      const clean = hex.replace('#', '');
      const rgb = [
        parseInt(clean.substring(0, 2), 16) / 255,
        parseInt(clean.substring(2, 4), 16) / 255,
        parseInt(clean.substring(4, 6), 16) / 255,
      ].map(val => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const rounded = Math.round(ratio * 100) / 100;

      return {
        ratio: rounded,
        aaNormal: rounded >= 4.5,
        aaLarge: rounded >= 3.0,
        aaaNormal: rounded >= 7.0,
        valid: true,
      };
    } catch {
      return { ratio: 0, aaNormal: false, aaLarge: false, aaaNormal: false, valid: false };
    }
  }, [fgColor, bgColor]);

  // --------------------------------------------------------------------------
  // 6. UUID & HASH GENERATOR STATE
  // --------------------------------------------------------------------------
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([
    '550e8400-e29b-41d4-a716-446655440000',
    '34f3e9a7-1266-4b27-acf9-02248dd771b3',
    '8e3b7c21-9984-482a-a9d1-cbf561490212',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'c9b1d8f2-3e4a-4a25-8d76-1f2e3d4c5b6a',
  ]);

  const generateNewUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      if (!uuidHyphens) u = u.replace(/-/g, '');
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setGeneratedUuids(list);
    addToast('Generated new UUIDs!', `${uuidCount} identifiers created`, 'success');
  };

  const toolsList = [
    { id: 'formatter', label: 'Code & JSON Formatter', icon: Code },
    { id: 'regex', label: 'Regex Tester & Matcher', icon: Terminal },
    { id: 'jwt', label: 'JWT & Token Inspector', icon: Key },
    { id: 'cron', label: 'Cron Schedule Parser', icon: Clock },
    { id: 'contrast', label: 'WCAG Contrast Checker', icon: Palette },
    { id: 'uuid', label: 'UUID & Token Generator', icon: Hash },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          Developer Utilities Suite
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Engineering Sandbox Tools
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
          Client-side developer utilities built directly into Yaswant Code for fast formatting, token debugging, regex testing, and accessibility checks.
        </p>
      </div>

      {/* Main Container: Tool Navigation Sidebar & Active Tool Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tab Selector */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id as ToolTab)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all whitespace-nowrap lg:whitespace-normal ${
                  isActive
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-400'}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Active Utility Card */}
        <div className="lg:col-span-9">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
            
            {/* ---------------------------------------------------------------- */}
            {/* 1. CODE & JSON FORMATTER */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'formatter' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                      JSON & Code Formatter / Minifier
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Validate syntax, beautify indentation, or compress payloads into single-line minified strings.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFormatterType('json')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        formatterType === 'json' ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setFormatterType('sql')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        formatterType === 'sql' ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500'
                      }`}
                    >
                      SQL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        Input Raw Code
                      </label>
                      <button
                        onClick={() => {
                          if (formatterType === 'json') {
                            setFormatterInput('{"cluster":"alpha","nodes":[1,2,3],"metrics":{"cpu":14.2,"memory":"12GB"}}');
                          } else {
                            setFormatterInput('SELECT id, name, email FROM users WHERE active = true ORDER BY created_at DESC LIMIT 50;');
                          }
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline"
                      >
                        Load Sample
                      </button>
                    </div>
                    <textarea
                      value={formatterInput}
                      onChange={(e) => setFormatterInput(e.target.value)}
                      rows={12}
                      className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        Processed Output
                      </label>
                      {formattedOutput && (
                        <button
                          onClick={() => copyToClipboard(formattedOutput, 'formatter-out')}
                          className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'formatter-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'formatter-out' ? 'Copied!' : 'Copy Result'}</span>
                        </button>
                      )}
                    </div>
                    <div className="w-full h-[252px] p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre leading-relaxed">
                      {formattedOutput || '// Formatted output will appear here'}
                    </div>
                  </div>
                </div>

                {formatterError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formatterError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => (formatterType === 'json' ? handleFormatJson(false) : handleFormatSql(false))}
                  >
                    Format & Indent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (formatterType === 'json' ? handleFormatJson(true) : handleFormatSql(true))}
                  >
                    Minify / Compress
                  </Button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 2. REGEX TESTER */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'regex' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                      Regular Expression Tester & Matcher
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Real-time regex evaluation against sample test strings with group extraction.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
                    {(['email', 'url', 'semver', 'uuid'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => loadRegexPreset(preset)}
                        className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-mono capitalize"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Row */}
                <div>
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Regex Pattern & Flags
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neutral-400 text-xs">/</span>
                      <input
                        type="text"
                        value={regexPattern}
                        onChange={(e) => setRegexPattern(e.target.value)}
                        placeholder="pattern..."
                        className="w-full pl-6 pr-4 py-2 font-mono text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-neutral-400 text-xs">/</span>
                    </div>

                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl text-xs font-mono">
                      <button
                        onClick={() => setRegexFlags(f => ({ ...f, g: !f.g }))}
                        className={`px-2 py-1 rounded ${regexFlags.g ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold' : 'text-neutral-500'}`}
                      >
                        g
                      </button>
                      <button
                        onClick={() => setRegexFlags(f => ({ ...f, i: !f.i }))}
                        className={`px-2 py-1 rounded ${regexFlags.i ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold' : 'text-neutral-500'}`}
                      >
                        i
                      </button>
                      <button
                        onClick={() => setRegexFlags(f => ({ ...f, m: !f.m }))}
                        className={`px-2 py-1 rounded ${regexFlags.m ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold' : 'text-neutral-500'}`}
                      >
                        m
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test String */}
                <div>
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Test String
                  </label>
                  <textarea
                    value={regexTestString}
                    onChange={(e) => setRegexTestString(e.target.value)}
                    rows={4}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Match Results */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Matches Found: {regexResults.matches.length}
                    </span>
                    {regexResults.valid && (
                      <span className="text-xs text-emerald-500 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pattern Valid
                      </span>
                    )}
                  </div>

                  {regexResults.error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                      {regexResults.error}
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {regexResults.matches.map((match, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400">
                            #{idx + 1}
                          </span>
                          <span className="text-neutral-900 dark:text-white font-bold truncate">
                            {match.text}
                          </span>
                        </div>

                        {match.groups && match.groups.length > 0 && (
                          <span className="text-[10px] text-neutral-500 truncate pl-2">
                            Groups: {match.groups.join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 3. JWT TOKEN INSPECTOR */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'jwt' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                      JWT & Base64 Token Inspector
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Decode JSON Web Tokens instantly to inspect roles, claims, and expiry timestamps.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJwtInput(SAMPLE_JWT)}
                  >
                    Load Sample JWT
                  </Button>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Encoded Token
                  </label>
                  <textarea
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    rows={3}
                    placeholder="Paste eyJhbGciOi..."
                    className="w-full p-3 font-mono text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none resize-none break-all"
                  />
                </div>

                {decodedJwt?.error ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                    {decodedJwt.error}
                  </div>
                ) : decodedJwt ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-neutral-500">Token Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                        decodedJwt.isExpired ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {decodedJwt.expStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Header */}
                      <div>
                        <div className="text-xs font-bold text-rose-500 mb-1">HEADER (Algorithm & Type)</div>
                        <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-rose-400 font-mono text-xs overflow-x-auto">
                          {JSON.stringify(decodedJwt.header, null, 2)}
                        </pre>
                      </div>

                      {/* Payload */}
                      <div>
                        <div className="text-xs font-bold text-indigo-400 mb-1">PAYLOAD (Data Claims)</div>
                        <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-indigo-300 font-mono text-xs overflow-x-auto">
                          {JSON.stringify(decodedJwt.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 4. CRON EXPRESSION PARSER */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'cron' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                    Cron Schedule Parser & Humanizer
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Translate Unix cron syntax into plain English and preview upcoming execution schedules.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Cron Expression (Minute Hour Day-of-Month Month Day-of-Week)
                  </label>
                  <input
                    type="text"
                    value={cronInput}
                    onChange={(e) => setCronInput(e.target.value)}
                    placeholder="*/15 * * * *"
                    className="w-full p-3 font-mono text-sm rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none font-bold"
                  />
                </div>

                {/* Human Description Card */}
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                  <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-indigo-500 mb-1">
                    Human Interpretation
                  </div>
                  <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {cronExplanation.text}
                  </div>
                </div>

                {/* Upcoming Runs */}
                <div>
                  <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Next 5 Scheduled Executions (Simulated)
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    {cronExplanation.runs.map((r, i) => (
                      <div key={i} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 5. WCAG CONTRAST CHECKER */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'contrast' && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                    WCAG 2.1 Color Contrast Ratio Checker
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Verify legibility and accessibility compliance for text against background canvases.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Foreground / Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="font-mono text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="font-mono text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Contrast Preview Card */}
                <div 
                  className="p-6 rounded-2xl border transition-all flex flex-col justify-center"
                  style={{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor + '33' }}
                >
                  <div className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                    Yaswant Code Typography Preview
                  </div>
                  <div className="text-xs opacity-90 leading-relaxed max-w-lg">
                    The quick brown fox jumps over the lazy dog. Production systems require high-contrast readability across all monitor environments.
                  </div>
                </div>

                {/* Score Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Contrast Ratio</div>
                    <div className="text-lg font-black text-neutral-900 dark:text-white font-mono mt-0.5">
                      {contrastResult.ratio} : 1
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">AA Normal Text</div>
                    <div className={`text-sm font-bold mt-1 ${contrastResult.aaNormal ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {contrastResult.aaNormal ? 'PASS (≥4.5)' : 'FAIL'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">AA Large Text</div>
                    <div className={`text-sm font-bold mt-1 ${contrastResult.aaLarge ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {contrastResult.aaLarge ? 'PASS (≥3.0)' : 'FAIL'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">AAA Enhanced</div>
                    <div className={`text-sm font-bold mt-1 ${contrastResult.aaaNormal ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {contrastResult.aaaNormal ? 'PASS (≥7.0)' : 'FAIL'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 6. UUID & HASH GENERATOR */}
            {/* ---------------------------------------------------------------- */}
            {activeTab === 'uuid' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                      UUID v4 Generator & Hasher
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Generate cryptographically pseudorandom UUID v4 identifiers in batch.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={generateNewUuids}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Generate New
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-400">Quantity:</span>
                    <select
                      value={uuidCount}
                      onChange={(e) => setUuidCount(Number(e.target.value))}
                      className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono"
                    >
                      <option value={1}>1 UUID</option>
                      <option value={5}>5 UUIDs</option>
                      <option value={10}>10 UUIDs</option>
                      <option value={20}>20 UUIDs</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uuidHyphens}
                      onChange={(e) => setUuidHyphens(e.target.checked)}
                      className="rounded"
                    />
                    <span>Include Hyphens</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uuidUppercase}
                      onChange={(e) => setUuidUppercase(e.target.checked)}
                      className="rounded"
                    />
                    <span>Uppercase</span>
                  </label>
                </div>

                {/* Output List */}
                <div className="space-y-1.5 font-mono text-xs">
                  {generatedUuids.map((uuid, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between group hover:border-neutral-400 transition-colors"
                    >
                      <span className="text-neutral-900 dark:text-neutral-100 truncate pr-2">
                        {uuid}
                      </span>
                      <button
                        onClick={() => copyToClipboard(uuid, `uuid-${idx}`, 'UUID copied!')}
                        className="text-neutral-400 hover:text-neutral-950 dark:hover:text-white shrink-0"
                      >
                        {copiedKey === `uuid-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedUuids.join('\n'), 'all-uuids', 'All UUIDs copied to clipboard!')}
                  >
                    Copy All {generatedUuids.length} UUIDs
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
