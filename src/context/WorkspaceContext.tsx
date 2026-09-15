import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  googleWorkspace, 
  DriveFileItem, 
  CalendarEventItem, 
  ChatSpaceItem, 
  ChatMessageItem, 
  GmailMessageItem 
} from '../services/googleWorkspace';

interface WorkspaceContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWorkspace: () => Promise<void>;
  disconnectWorkspace: () => void;
  
  // Drive
  driveFiles: DriveFileItem[];
  isLoadingDrive: boolean;
  refreshDrive: (query?: string) => Promise<void>;
  uploadNoteToDrive: (title: string, content: string) => Promise<DriveFileItem>;

  // Calendar
  calendarEvents: CalendarEventItem[];
  isLoadingCalendar: boolean;
  refreshCalendar: () => Promise<void>;
  scheduleCalendarEvent: (event: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
  }) => Promise<CalendarEventItem>;

  // Chat
  chatSpaces: ChatSpaceItem[];
  activeSpace: ChatSpaceItem | null;
  setActiveSpace: (space: ChatSpaceItem | null) => void;
  chatMessages: ChatMessageItem[];
  isLoadingChat: boolean;
  refreshChatSpaces: () => Promise<void>;
  loadMessagesForSpace: (spaceName: string) => Promise<void>;
  postChatMessage: (text: string) => Promise<ChatMessageItem>;

  // Gmail
  gmailMessages: GmailMessageItem[];
  isLoadingGmail: boolean;
  refreshGmail: (query?: string) => Promise<void>;
  sendEmail: (to: string, subject: string, body: string) => Promise<{ id: string }>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Sample fallback data when not yet connected to show clean initial preview
const DEMO_DRIVE_FILES: DriveFileItem[] = [
  {
    id: 'demo-drive-1',
    name: 'CS401-Distributed-Systems-Syllabus.pdf',
    mimeType: 'application/pdf',
    modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    size: '1.4 MB',
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'demo-drive-2',
    name: 'React19-Server-Actions-CheatSheet.md',
    mimeType: 'text/markdown',
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    size: '42 KB',
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'demo-drive-3',
    name: 'Rust-MemTable-Architecture-Spec.docx',
    mimeType: 'application/vnd.google-apps.document',
    modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    size: '350 KB',
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'demo-drive-4',
    name: 'Capstone-Milestone-Deliverables.xlsx',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    modifiedTime: new Date(Date.now() - 3600000 * 72).toISOString(),
    size: '128 KB',
    webViewLink: 'https://drive.google.com'
  }
];

const DEMO_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: 'demo-cal-1',
    summary: 'Distributed Systems & Raft Consensus Live Lecture',
    description: 'Deep dive into term election, log entries, and heartbeats with Dr. Alex Rivera.',
    location: 'Google Meet (meet.google.com/yas-code-live)',
    start: { dateTime: new Date(Date.now() + 3600000 * 3).toISOString() },
    end: { dateTime: new Date(Date.now() + 3600000 * 5).toISOString() },
    htmlLink: 'https://calendar.google.com'
  },
  {
    id: 'demo-cal-2',
    summary: 'Full-Stack Capstone Milestone 2 Office Hours',
    description: '1-on-1 code reviews with Senior Staff Instructors.',
    location: 'Google Meet',
    start: { dateTime: new Date(Date.now() + 3600000 * 26).toISOString() },
    end: { dateTime: new Date(Date.now() + 3600000 * 28).toISOString() },
    htmlLink: 'https://calendar.google.com'
  },
  {
    id: 'demo-cal-3',
    summary: 'eBPF Kernel Tracing & Network Security Workshop',
    description: 'Hands-on socket filtering and ring buffer benchmarking.',
    location: 'Google Meet Room 4',
    start: { dateTime: new Date(Date.now() + 3600000 * 52).toISOString() },
    end: { dateTime: new Date(Date.now() + 3600000 * 54).toISOString() },
    htmlLink: 'https://calendar.google.com'
  }
];

const DEMO_CHAT_SPACES: ChatSpaceItem[] = [
  {
    name: 'spaces/general-cohort',
    displayName: 'Yaswant Code • Fall 2026 Cohort',
    type: 'SPACE'
  },
  {
    name: 'spaces/react-mastery',
    displayName: 'Advanced React & Server Actions Hub',
    type: 'SPACE'
  },
  {
    name: 'spaces/instructor-qa',
    displayName: 'Instructors & TA Office Hours',
    type: 'SPACE'
  }
];

const DEMO_CHAT_MESSAGES: ChatMessageItem[] = [
  {
    name: 'msg-1',
    text: 'Welcome to the Yaswant Code cohort chat! Feel free to ask any architecture or debugging questions here.',
    createTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    sender: { displayName: 'Dr. Alex Rivera (Lead Instructor)', type: 'HUMAN' }
  },
  {
    name: 'msg-2',
    text: 'Make sure to check Google Drive for the updated Milestone 2 starter templates.',
    createTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    sender: { displayName: 'Elena Rostova (TA)', type: 'HUMAN' }
  },
  {
    name: 'msg-3',
    text: 'Just deployed the Raft leader election branch! Jepsen testing passed all partitions.',
    createTime: new Date(Date.now() - 3600000 * 1).toISOString(),
    sender: { displayName: 'Marcus Vance', type: 'HUMAN' }
  }
];

const DEMO_GMAIL_MESSAGES: GmailMessageItem[] = [
  {
    id: 'demo-mail-1',
    threadId: 'th-1',
    subject: 'Welcome to Yaswant Code: Your Complete Learning Roadmap',
    from: 'admissions@yaswantcode.edu',
    date: 'Today, 8:30 AM',
    snippet: 'Congratulations on your enrollment! Here is your student guide, syllabus calendar sync link, and Google Drive access...',
    unread: true
  },
  {
    id: 'demo-mail-2',
    threadId: 'th-2',
    subject: 'Code Review Approved: Milestone 1 Distributed Kanban',
    from: 'alex.rivera@yaswantcode.edu',
    date: 'Yesterday',
    snippet: 'Excellent implementation of optimistic UI updates and rollback boundaries. Keep up the high standard...',
    unread: false
  },
  {
    id: 'demo-mail-3',
    threadId: 'th-3',
    subject: 'Upcoming Live Q&A: Autonomous AI Agents with Gemini 2.5',
    from: 'events@yaswantcode.edu',
    date: 'Sep 12',
    snippet: 'Reminder: Live session starting tomorrow. We will review tool-calling schemas and vector memory...',
    unread: false
  }
];

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(googleWorkspace.isConnected());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>(DEMO_DRIVE_FILES);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(DEMO_CALENDAR_EVENTS);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState<boolean>(false);

  // Chat state
  const [chatSpaces, setChatSpaces] = useState<ChatSpaceItem[]>(DEMO_CHAT_SPACES);
  const [activeSpace, setActiveSpace] = useState<ChatSpaceItem | null>(DEMO_CHAT_SPACES[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(DEMO_CHAT_MESSAGES);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<GmailMessageItem[]>(DEMO_GMAIL_MESSAGES);
  const [isLoadingGmail, setIsLoadingGmail] = useState<boolean>(false);

  // Refresh all services with real Google data if connected
  const refreshAll = useCallback(async () => {
    if (!googleWorkspace.isConnected()) return;

    // Load Drive
    setIsLoadingDrive(true);
    try {
      const files = await googleWorkspace.listDriveFiles();
      if (files.length > 0) setDriveFiles(files);
    } catch (e) {
      console.warn('Drive load notice:', e);
    } finally {
      setIsLoadingDrive(false);
    }

    // Load Calendar
    setIsLoadingCalendar(true);
    try {
      const events = await googleWorkspace.listCalendarEvents();
      if (events.length > 0) setCalendarEvents(events);
    } catch (e) {
      console.warn('Calendar load notice:', e);
    } finally {
      setIsLoadingCalendar(false);
    }

    // Load Chat Spaces
    setIsLoadingChat(true);
    try {
      const spaces = await googleWorkspace.listChatSpaces();
      if (spaces.length > 0) {
        setChatSpaces(spaces);
        setActiveSpace(spaces[0]);
        const msgs = await googleWorkspace.listChatMessages(spaces[0].name);
        if (msgs.length > 0) setChatMessages(msgs);
      }
    } catch (e) {
      console.warn('Chat load notice:', e);
    } finally {
      setIsLoadingChat(false);
    }

    // Load Gmail
    setIsLoadingGmail(true);
    try {
      const mails = await googleWorkspace.listGmailMessages();
      if (mails.length > 0) setGmailMessages(mails);
    } catch (e) {
      console.warn('Gmail load notice:', e);
    } finally {
      setIsLoadingGmail(false);
    }
  }, []);

  useEffect(() => {
    if (googleWorkspace.isConnected()) {
      setIsConnected(true);
      refreshAll();
    }
  }, [refreshAll]);

  const connectWorkspace = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await googleWorkspace.requestOAuthToken();
      setIsConnected(true);
      await refreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth authorization was declined or encountered an error';
      setError(msg);
      console.error('Workspace connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWorkspace = () => {
    googleWorkspace.disconnect();
    setIsConnected(false);
    setDriveFiles(DEMO_DRIVE_FILES);
    setCalendarEvents(DEMO_CALENDAR_EVENTS);
    setChatSpaces(DEMO_CHAT_SPACES);
    setActiveSpace(DEMO_CHAT_SPACES[0]);
    setChatMessages(DEMO_CHAT_MESSAGES);
    setGmailMessages(DEMO_GMAIL_MESSAGES);
  };

  // Drive Actions
  const refreshDrive = async (query?: string) => {
    if (!googleWorkspace.isConnected()) return;
    setIsLoadingDrive(true);
    try {
      const files = await googleWorkspace.listDriveFiles(query);
      setDriveFiles(files);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const uploadNoteToDrive = async (title: string, content: string): Promise<DriveFileItem> => {
    if (!googleWorkspace.isConnected()) {
      // Local fallback simulation
      const mockFile: DriveFileItem = {
        id: `mock-drive-${Date.now()}`,
        name: `${title.replace(/\s+/g, '_')}.md`,
        mimeType: 'text/markdown',
        modifiedTime: new Date().toISOString(),
        size: `${Math.round(content.length / 1024 * 10) / 10 || 1} KB`,
        webViewLink: 'https://drive.google.com'
      };
      setDriveFiles(prev => [mockFile, ...prev]);
      return mockFile;
    }

    const created = await googleWorkspace.createDriveFile(`${title}.md`, content, 'text/markdown');
    setDriveFiles(prev => [created, ...prev]);
    return created;
  };

  // Calendar Actions
  const refreshCalendar = async () => {
    if (!googleWorkspace.isConnected()) return;
    setIsLoadingCalendar(true);
    try {
      const events = await googleWorkspace.listCalendarEvents();
      setCalendarEvents(events);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh Google Calendar');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const scheduleCalendarEvent = async (eventData: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
  }): Promise<CalendarEventItem> => {
    if (!googleWorkspace.isConnected()) {
      const mockEvent: CalendarEventItem = {
        id: `mock-cal-${Date.now()}`,
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: { dateTime: eventData.startDateTime },
        end: { dateTime: eventData.endDateTime },
        htmlLink: 'https://calendar.google.com'
      };
      setCalendarEvents(prev => [mockEvent, ...prev]);
      return mockEvent;
    }

    const created = await googleWorkspace.createCalendarEvent(eventData);
    setCalendarEvents(prev => [created, ...prev]);
    return created;
  };

  // Chat Actions
  const refreshChatSpaces = async () => {
    if (!googleWorkspace.isConnected()) return;
    setIsLoadingChat(true);
    try {
      const spaces = await googleWorkspace.listChatSpaces();
      setChatSpaces(spaces);
    } catch (err: unknown) {
      console.warn(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const loadMessagesForSpace = async (spaceName: string) => {
    if (!googleWorkspace.isConnected()) return;
    setIsLoadingChat(true);
    try {
      const msgs = await googleWorkspace.listChatMessages(spaceName);
      setChatMessages(msgs);
    } catch (err: unknown) {
      console.warn(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const postChatMessage = async (text: string): Promise<ChatMessageItem> => {
    const spaceName = activeSpace?.name || 'spaces/general';
    if (!googleWorkspace.isConnected()) {
      const mockMsg: ChatMessageItem = {
        name: `mock-msg-${Date.now()}`,
        text,
        createTime: new Date().toISOString(),
        sender: { displayName: 'You (Student)', type: 'HUMAN' }
      };
      setChatMessages(prev => [...prev, mockMsg]);
      return mockMsg;
    }

    const sent = await googleWorkspace.sendChatMessage(spaceName, text);
    setChatMessages(prev => [...prev, sent]);
    return sent;
  };

  // Gmail Actions
  const refreshGmail = async (query?: string) => {
    if (!googleWorkspace.isConnected()) return;
    setIsLoadingGmail(true);
    try {
      const msgs = await googleWorkspace.listGmailMessages(query);
      setGmailMessages(msgs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Gmail messages');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const sendEmail = async (to: string, subject: string, body: string): Promise<{ id: string }> => {
    if (!googleWorkspace.isConnected()) {
      const mockMail: GmailMessageItem = {
        id: `mock-mail-${Date.now()}`,
        threadId: `th-${Date.now()}`,
        subject,
        from: 'You (yaswantcode.edu)',
        date: 'Just now',
        snippet: body.slice(0, 100),
        unread: false
      };
      setGmailMessages(prev => [mockMail, ...prev]);
      return { id: mockMail.id };
    }

    const sent = await googleWorkspace.sendGmailMessage(to, subject, body);
    await refreshGmail();
    return sent;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        isConnected,
        isConnecting,
        error,
        connectWorkspace,
        disconnectWorkspace,

        driveFiles,
        isLoadingDrive,
        refreshDrive,
        uploadNoteToDrive,

        calendarEvents,
        isLoadingCalendar,
        refreshCalendar,
        scheduleCalendarEvent,

        chatSpaces,
        activeSpace,
        setActiveSpace,
        chatMessages,
        isLoadingChat,
        refreshChatSpaces,
        loadMessagesForSpace,
        postChatMessage,

        gmailMessages,
        isLoadingGmail,
        refreshGmail,
        sendEmail,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
