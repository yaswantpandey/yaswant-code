import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_CERTIFICATES } from '../data/mockData';
import { Certificate } from '../types/lms';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  Share2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Copy, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CertificatePage: React.FC = () => {
  const { setCertificateModal, addToast, brandName } = useLms();
  const [verifyIdInput, setVerifyIdInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<Certificate | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    const found = MOCK_CERTIFICATES.find(
      c => c.credentialId.toLowerCase() === verifyIdInput.trim().toLowerCase()
    );
    setVerificationResult(found || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Credential Registry
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Verified Digital Certificates
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
          Cryptographically signed engineering certificates awarded upon successful completion of production capstones and rigor assessments.
        </p>
      </div>

      {/* Verification Search Bar */}
      <GlassCard className="p-6">
        <div className="max-w-2xl">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Public Credential Verifier
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Enter any candidate&apos;s credential ID (e.g. <code className="text-neutral-800 dark:text-neutral-200 font-mono">APX-98214-FS</code>) to inspect syllabus verification and honors.
          </p>

          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={verifyIdInput}
                onChange={(e) => setVerifyIdInput(e.target.value)}
                placeholder="Enter Credential ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Verify
            </Button>
          </form>

          {/* Search Result */}
          {searchAttempted && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {verificationResult ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Valid Credential Authenticated
                    </div>
                    <div className="text-neutral-700 dark:text-neutral-300 mt-1">
                      Awarded to <strong>{verificationResult.studentName}</strong> for <em>{verificationResult.courseTitle}</em>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCertificateModal(verificationResult)}
                  >
                    View Record
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-850 text-xs text-neutral-500">
                  No certificate record matches &ldquo;{verifyIdInput}&rdquo;. Please verify the identifier and try again.
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* User's Certificate Gallery */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
          My Earned Credentials ({MOCK_CERTIFICATES.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CERTIFICATES.map((cert) => (
            <GlassCard
              key={cert.id}
              hoverEffect
              className="p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm shadow-md">
                    ▲
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3 h-3 mr-1 inline" /> Verified
                    </Badge>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {cert.credentialId}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 mb-1">
                  Issued by {brandName} Academy
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 dark:text-white mb-2 leading-tight">
                  {cert.courseTitle}
                </h3>
                <p className="text-xs text-neutral-500">
                  Awarded to <strong className="text-neutral-800 dark:text-neutral-200">{cert.studentName}</strong> with High Distinction honors under Instructor {cert.instructorName}.
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {cert.skillsAcquired.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{cert.issueDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Share2 className="w-3.5 h-3.5" />}
                    onClick={() => addToast("Share Link Copied", "LinkedIn credential link copied.", "info")}
                  >
                    Share
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => setCertificateModal(cert)}
                  >
                    View Certificate
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};
