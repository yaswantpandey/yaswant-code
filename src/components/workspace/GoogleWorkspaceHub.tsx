import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Badge } from '../ui/Badge';
import { 
  FolderOpen, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Send, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Video,
  FileCode,
  FileSpreadsheet,
  DownloadCloud,
  ChevronRight,
  Database
} from 'lucide-react';

export const GoogleWorkspaceHub: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    error,
    connectWorkspace,
    disconnectWorkspace,
    
    // Drive
    driveFiles,
    isLoadingDrive,
    refreshDrive,
    uploadNoteToDrive,

    // Calendar
    calendarEvents,
    isLoadingCalendar,
    refreshCalendar,
    scheduleCalendarEvent,

    // Chat
    chatSpaces,
    activeSpace,
    setActiveSpace,
    chatMessages,
    isLoadingChat,
    refreshChatSpaces,
    loadMessagesForSpace,
    postChatMessage,

    // Gmail
    gmailMessages,
    isLoadingGmail,
    refreshGmail,
    sendEmail
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'drive' | 'calendar' | 'chat' | 'gmail'>('drive');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar Event Form Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Chat Composer
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Gmail Compose Modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('admissions@yaswantcode.edu');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [composeStatus, setComposeStatus] = useState<string | null>(null);

  // Drive quick upload modal
  const [isUploadNoteOpen, setIsUploadNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isUploadingNote, setIsUploadingNote] = useState(false);

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setIsSubmittingEvent(true);
    try {
      const start = new Date(newEventDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      await scheduleCalendarEvent({
        summary: newEventTitle,
        description: newEventDesc || 'Study lecture session scheduled from Yaswant Code LMS',
        location: 'Google Meet',
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString()
      });
      setIsEventModalOpen(false);
      setNewEventTitle('');
      setNewEventDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Handle Chat message sending
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || isSendingChat) return;
    setIsSendingChat(true);
    try {
      await postChatMessage(chatInputText);
      setChatInputText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle Email sending
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo.trim() || !emailSubject.trim() || isSendingEmail) return;
    setIsSendingEmail(true);
    try {
      await sendEmail(emailTo, emailSubject, emailBody);
      setComposeStatus('Email successfully dispatched via Gmail API!');
      setTimeout(() => {
        setIsComposeOpen(false);
        setComposeStatus(null);
        setEmailSubject('');
        setEmailBody('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setComposeStatus('Failed to send email. Please verify Gmail permissions.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle Note Upload to Drive
  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || isUploadingNote) return;
    setIsUploadingNote(true);
    try {
      await uploadNoteToDrive(newNoteTitle, newNoteContent);
      setIsUploadNoteOpen(false);
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingNote(false);
    }
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('markdown') || mimeType.includes('plain')) return <FileCode className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FolderOpen className="w-5 h-5 text-amber-500" />;
  };

  const filteredDriveFiles = driveFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Banner: Status & Connection Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Google Workspace & Cloud Sync</h1>
              <Badge variant={isConnected ? 'emerald' : 'amber'} size="md">
                {isConnected ? 'Connected to Google' : 'Local Preview Mode'}
              </Badge>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Unified hub integrating <strong>Google Drive</strong> course repositories, <strong>Google Calendar</strong> live class schedules, <strong>Google Chat</strong> cohort discussions, and <strong>Gmail</strong> academic communications with <strong>Firebase Firestore</strong> cloud persistence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isConnected ? (
              <>
                <button
                  onClick={() => {
                    refreshDrive();
                    refreshCalendar();
                    refreshChatSpaces();
                    refreshGmail();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-sm font-medium transition-all"
                  title="Synchronize Google Workspace data"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync All
                </button>
                <button
                  onClick={disconnectWorkspace}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 rounded-xl text-sm font-medium transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWorkspace}
                disabled={isConnecting}
                className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting Google Workspace...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Connect Google Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Google Drive ({driveFiles.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Google Calendar ({calendarEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Google Chat ({chatSpaces.length} Spaces)
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'gmail'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          Gmail ({gmailMessages.filter(m => m.unread).length} Unread)
        </button>
      </div>

      {/* TAB 1: GOOGLE DRIVE */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search course materials in Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => refreshDrive()}
                disabled={isLoadingDrive}
                className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-all"
                title="Refresh Google Drive"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsUploadNoteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                Upload Note to Drive
              </button>
            </div>
          </div>

          {/* Drive Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDriveFiles.map((file) => (
              <div
                key={file.id}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                      {getMimeIcon(file.mimeType)}
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 transition-colors"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {file.size || 'Google Cloud'} • {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{file.mimeType.split('.').pop()}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Academic Calendar & Live Cohort Schedule</h2>
              <p className="text-xs text-neutral-400">Synchronized directly with your Google Calendar.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshCalendar()}
                disabled={isLoadingCalendar}
                className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-all"
                title="Refresh Calendar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                Schedule Class / Event
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {calendarEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-800/40 text-center shrink-0 min-w-[64px]">
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      {evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleDateString('en-US', { month: 'short' }) : 'Event'}
                    </div>
                    <div className="text-xl font-extrabold leading-none mt-1">
                      {evt.start.dateTime ? new Date(evt.start.dateTime).getDate() : '—'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{evt.summary}</h3>
                    {evt.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 max-w-2xl">{evt.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1">
                      {evt.start.dateTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Video className="w-3.5 h-3.5" />
                          {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={evt.htmlLink || 'https://calendar.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-all"
                  >
                    View in Calendar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Left: Spaces List */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Google Chat Spaces</span>
                <button
                  onClick={() => refreshChatSpaces()}
                  disabled={isLoadingChat}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChat ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[460px]">
                {chatSpaces.map((space) => {
                  const isSelected = activeSpace?.name === space.name;
                  return (
                    <button
                      key={space.name}
                      onClick={() => {
                        setActiveSpace(space);
                        loadMessagesForSpace(space.name);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MessageSquare className="w-4 h-4 shrink-0 text-blue-500" />
                        <span className="text-xs truncate">{space.displayName}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Messages Stream & Composer */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            {/* Chat Space Header */}
            <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{activeSpace?.displayName || 'Chat Stream'}</h3>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{activeSpace?.name}</p>
              </div>
              <Badge variant="blue" size="sm">Google Chat Live</Badge>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
              {chatMessages.map((msg) => (
                <div key={msg.name} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {msg.sender?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3 max-w-[85%] border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{msg.sender?.displayName || 'Cohort Member'}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Composer */}
            <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={`Post message to ${activeSpace?.displayName || 'Google Chat space'}...`}
                className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim() || isSendingChat}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: GMAIL */}
      {activeTab === 'gmail' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Academic Communications & Inbox</h2>
              <p className="text-xs text-neutral-400">Read instructor feedback, course notifications, and compose emails via Gmail.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshGmail()}
                disabled={isLoadingGmail}
                className="p-2.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-all"
                title="Refresh Gmail"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingGmail ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Mail className="w-4 h-4" />
                Compose with Gmail
              </button>
            </div>
          </div>

          {/* Email Messages Feed */}
          <div className="space-y-3">
            {gmailMessages.map((mail) => (
              <div
                key={mail.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  mail.unread
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {mail.unread && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{mail.from}</span>
                      <span className="text-[11px] text-neutral-400">• {mail.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{mail.subject}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">{mail.snippet}</p>
                  </div>

                  <a
                    href={`https://mail.google.com/mail/u/0/#inbox/${mail.threadId || mail.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg shrink-0"
                    title="Open in Gmail"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Calendar Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Schedule on Google Calendar</h3>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Event / Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Office Hours"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Date & Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Description / Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes, study topics, questions for instructor..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isSubmittingEvent ? 'Adding to Google Calendar...' : 'Confirm & Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Compose Gmail */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Compose Email via Gmail API</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Recipient (To)
                </label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="Question regarding Milestone 2: Server Actions"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Dear Instructor, I have completed the optimistic rollback tests..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {composeStatus && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{composeStatus}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {isSendingEmail ? 'Sending via Gmail...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Upload Note to Google Drive */}
      {isUploadNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Save Note to Google Drive</h3>
              </div>
              <button
                onClick={() => setIsUploadNoteOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  File / Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed-Transactions-Notes"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Markdown / Code Content
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="# Distributed Transactions&#10;- Two-phase commit protocol&#10;- Consensus leader lease..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full font-mono text-xs px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadNoteOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingNote}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isUploadingNote ? 'Uploading to Drive...' : 'Save to Google Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleWorkspaceHub;
