import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Activity, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { addToast } = useLms();
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'finances' | 'audit'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | 'Student' | 'Instructor' | 'Admin'>('All');

  const [usersList, setUsersList] = useState([
    { id: 'usr-1', name: 'Alex Mercer', email: 'alex.mercer@dev.io', role: 'Student', status: 'Active', joined: 'Jan 2024' },
    { id: 'usr-2', name: 'Sarah Chen', email: 'sarah.chen@tech.org', role: 'Instructor', status: 'Verified', joined: 'Nov 2023' },
    { id: 'usr-3', name: 'Dr. Marcus Vance', email: 'm.vance@ai.stanford.edu', role: 'Instructor', status: 'Verified', joined: 'Dec 2023' },
    { id: 'usr-4', name: 'Elena Rostova', email: 'elena@cloudops.org', role: 'Student', status: 'Active', joined: 'Feb 2024' },
    { id: 'usr-5', name: 'Liam O’Connor', email: 'liam@rustacean.net', role: 'Instructor', status: 'Pending Verification', joined: 'Mar 2024' },
  ]);

  const [pendingCourses, setPendingCourses] = useState([
    {
      id: 'pc-1',
      title: 'High-Performance Rust Systems & Zero-Cost Abstractions',
      instructor: 'Liam O’Connor',
      category: 'Systems & Security',
      submittedDate: '2 days ago',
      modulesCount: 6
    },
    {
      id: 'pc-2',
      title: 'Distributed Transaction Sagas in Event-Driven Microservices',
      instructor: 'Dr. Marcus Vance',
      category: 'Distributed Systems',
      submittedDate: 'Yesterday',
      modulesCount: 8
    }
  ]);

  const handleApproveCourse = (id: string, title: string) => {
    setPendingCourses(prev => prev.filter(c => c.id !== id));
    addToast("Course Approved", `"${title}" has been published to the catalog.`, "success");
  };

  const handleRejectCourse = (id: string, title: string) => {
    setPendingCourses(prev => prev.filter(c => c.id !== id));
    addToast("Course Returned", `"${title}" sent back to instructor with revision notes.`, "info");
  };

  const filteredUsers = usersList.filter(u => {
    if (selectedRoleFilter !== 'All' && u.role !== selectedRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Platform Governance & Security
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          System Administration Portal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
          Global user provisioning, instructor credential auditing, course catalog quality control, and financial operations.
        </p>
      </div>

      {/* Global Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <BentoCard
          title="Total Engineers"
          value="142,890"
          subtitle="Enrolled accounts"
          change={{ value: '+1,240 this week', trend: 'up' }}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <BentoCard
          title="Vetted Mentors"
          value="128"
          subtitle="Principal & Staff level"
          change={{ value: '3 Pending review', trend: 'neutral' }}
          icon={<ShieldCheck className="w-5 h-5 text-purple-500" />}
        />
        <BentoCard
          title="Platform GMV"
          value="$842,500"
          subtitle="Monthly gross volume"
          change={{ value: '+19% vs Q2', trend: 'up' }}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Credentials Minted"
          value="18,420"
          subtitle="Cryptographically verified"
          change={{ value: '99.4% validity', trend: 'up' }}
          icon={<Award className="w-5 h-5 text-amber-500" />}
        />
        <BentoCard
          title="Approvals Queue"
          value={pendingCourses.length}
          subtitle="Courses awaiting audit"
          change={{ value: '1 SLA urgent', trend: 'down' }}
          icon={<Activity className="w-5 h-5 text-rose-500" />}
          onClick={() => setActiveTab('approvals')}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-8 text-xs sm:text-sm font-semibold">
        {(['users', 'approvals', 'finances', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab === 'approvals' ? `Course Approvals (${pendingCourses.length})` : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              {(['All', 'Student', 'Instructor', 'Admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedRoleFilter === r
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40">
                    <td className="py-3.5">
                      <div className="font-bold text-neutral-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-neutral-400">{u.email}</div>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={u.role === 'Admin' ? 'danger' : u.role === 'Instructor' ? 'purple' : 'neutral'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-neutral-400 font-mono">
                      {u.joined}
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => addToast("Permissions", `Managing permissions for ${u.name}`, "info")}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Tab: Approvals Queue */}
      {activeTab === 'approvals' && (
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Curriculum Quality Assurance Queue ({pendingCourses.length})
          </h3>

          {pendingCourses.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              All courses have been audited and verified. Queue is clear!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">{c.category}</Badge>
                      <span className="text-[11px] text-neutral-400 font-mono">Submitted {c.submittedDate}</span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{c.title}</h4>
                    <p className="text-xs text-neutral-500">
                      Instructor: <strong className="text-neutral-800 dark:text-neutral-200">{c.instructor}</strong> • {c.modulesCount} modules with capstone rubric
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectCourse(c.id, c.title)}
                    >
                      Request Revisions
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApproveCourse(c.id, c.title)}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Tab: Finances */}
      {activeTab === 'finances' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Platform Settlement & Instructor Payouts
            </h3>
            <Badge variant="success" size="sm">Auto-Payouts Scheduled on 1st</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
              <span className="text-xs text-neutral-400">Total Net Revenue (15% Cut)</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">$126,375</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
              <span className="text-xs text-neutral-400">Instructor Disbursements</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">$716,125</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
              <span className="text-xs text-neutral-400">Dispute / Refund Rate</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">0.12%</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
            Immutable Security & Activity Audit Trail
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { event: "CERT_MINT", desc: "Minted credential APX-98214-FS for Alex Mercer", time: "10 mins ago", ip: "192.168.1.14" },
              { event: "COURSE_PUBLISH", desc: "Approved Next.js 15 Canary Architecture", time: "1 hour ago", ip: "10.0.4.82" },
              { event: "ROLE_ELEVATE", desc: "Upgraded Sarah Chen to Staff Instructor", time: "1 day ago", ip: "172.16.0.4" }
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex items-center justify-between gap-4">
                <div>
                  <span className="text-emerald-500 font-bold mr-2">[{log.event}]</span>
                  <span className="text-neutral-800 dark:text-neutral-200">{log.desc}</span>
                </div>
                <div className="text-neutral-400 text-[10px] shrink-0">
                  {log.time} • {log.ip}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
};
