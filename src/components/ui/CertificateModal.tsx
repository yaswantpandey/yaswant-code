import React from 'react';
import { useLms } from '../../context/LmsContext';
import { 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export const CertificateModal: React.FC = () => {
  const { certificateModal, setCertificateModal, addToast, brandName } = useLms();

  if (!certificateModal) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(certificateModal.verificationUrl);
    addToast("Credential Link Copied!", "Shareable URL copied to clipboard.", "success");
  };

  const handleDownload = () => {
    addToast("Generating High-Res PDF", "Your verified certificate download has started.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Official Digital Credential</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">Certificate of Technical Mastery</div>
            </div>
          </div>
          <button 
            onClick={() => setCertificateModal(null)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {/* Certificate Canvas / Plaque */}
          <div className="relative rounded-2xl bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 p-8 sm:p-12 text-center shadow-lg overflow-hidden">
            {/* Corner Decorative Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500/60 rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/60 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/60 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500/60 rounded-br" />

            {/* Institution Brand */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="font-bold tracking-tight text-neutral-900 dark:text-white text-sm">
                {brandName}
              </span>
            </div>

            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
              Certificate of Completion & Excellence
            </p>
            <p className="text-xs text-neutral-500 mb-4">This digital credential is proudly conferred upon</p>

            {/* Recipient */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-2">
              {certificateModal.studentName}
            </h2>
            <div className="w-24 h-0.5 bg-neutral-300 dark:bg-neutral-700 mx-auto mb-4" />

            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-2">
              for successfully mastering rigorous coursework, real-world engineering projects, and passing evaluations in
            </p>

            {/* Course Title */}
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-4">
              {certificateModal.courseTitle}
            </h3>

            {/* Skills Pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-8 max-w-lg mx-auto">
              {certificateModal.skillsAcquired.map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Signatures & Verification Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-left items-end">
              <div>
                <div className="font-serif italic text-base text-neutral-800 dark:text-neutral-200">
                  {certificateModal.instructorName}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Lead Course Instructor</div>
              </div>

              <div className="text-center sm:text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Credential
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  ID: {certificateModal.credentialId}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {certificateModal.issueDate}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Issue Date • No Expiration</div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <QrCode className="w-4 h-4 text-neutral-400" />
              <span>Public Verification URL active</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<Share2 className="w-3.5 h-3.5" />} onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button variant="secondary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />} onClick={() => addToast("Added to LinkedIn", "Shared to LinkedIn profile licenses section.", "success")}>
                Add to LinkedIn
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleDownload}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
