/**
 * Google Workspace Client Service
 * Integrates Google Drive, Google Calendar, Google Chat, and Gmail
 * Uses Google Identity Services (GSI) Token Client with direct REST endpoints
 */

import { GOOGLE_CLIENT_ID } from '../lib/firebase';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.messages.create',
].join(' ');

const TOKEN_STORAGE_KEY = 'yaswant_google_workspace_token';
const TOKEN_EXPIRY_KEY = 'yaswant_google_workspace_token_expiry';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  colorId?: string;
}

export interface ChatSpaceItem {
  name: string; // e.g. "spaces/AAAAAAAA"
  displayName: string;
  type: string; // "SPACE" | "GROUP_CHAT" | "DIRECT_MESSAGE"
  spaceThreadingState?: string;
}

export interface ChatMessageItem {
  name: string;
  text: string;
  createTime: string;
  sender?: {
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  internalDate?: string;
  unread?: boolean;
}

export class GoogleWorkspaceService {
  private token: string | null = null;

  constructor() {
    this.token = this.getStoredToken();
  }

  public getStoredToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (token && expiry && Date.now() < Number(expiry)) {
        return token;
      }
      return null;
    } catch {
      return null;
    }
  }

  public isConnected(): boolean {
    return Boolean(this.getStoredToken());
  }

  public saveToken(token: string, expiresInSec: number = 3599) {
    this.token = token;
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + (expiresInSec * 1000) - 60000));
    } catch (e) {
      console.error('Failed to store Google token', e);
    }
  }

  public disconnect() {
    this.token = null;
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (e) {
      console.error('Failed to clear token', e);
    }
  }

  public async requestOAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services library is not loaded yet. Please try again in a few seconds.'));
        return;
      }

      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: WORKSPACE_SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }
            if (response.access_token) {
              this.saveToken(response.access_token, response.expires_in || 3600);
              resolve(response.access_token);
            } else {
              reject(new Error('No access token received'));
            }
          },
          error_callback: (err) => {
            reject(err);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  private async fetchGoogleApi<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Google Workspace is not connected. Please connect your Google account.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      this.disconnect();
      throw new Error('Google authorization expired. Please reconnect your account.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `Google API Error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  }

  // ==========================================================================
  // GOOGLE DRIVE APIs
  // ==========================================================================

  public async listDriveFiles(query: string = "trashed = false"): Promise<DriveFileItem[]> {
    const fields = 'files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink)';
    const encodedQ = encodeURIComponent(query);
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=25&fields=${encodeURIComponent(fields)}&q=${encodedQ}&orderBy=modifiedTime desc`;
    const data = await this.fetchGoogleApi<{ files: DriveFileItem[] }>(url);
    return data.files || [];
  }

  public async createDriveFile(name: string, content: string, mimeType: string = 'text/plain'): Promise<DriveFileItem> {
    const token = this.getStoredToken();
    if (!token) throw new Error('Not authenticated');

    const metadata = {
      name,
      mimeType,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to upload file to Google Drive: ${err}`);
    }

    return response.json();
  }

  // ==========================================================================
  // GOOGLE CALENDAR APIs
  // ==========================================================================

  public async listCalendarEvents(timeMin?: string): Promise<CalendarEventItem[]> {
    const minTime = timeMin || new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(minTime)}&singleEvents=true&orderBy=startTime&maxResults=25`;
    const data = await this.fetchGoogleApi<{ items: CalendarEventItem[] }>(url);
    return data.items || [];
  }

  public async createCalendarEvent(eventData: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string; // ISO string
    endDateTime: string;   // ISO string
  }): Promise<CalendarEventItem> {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const body = {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startDateTime,
        timeZone,
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone,
      },
    };

    return this.fetchGoogleApi<CalendarEventItem>('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  }

  // ==========================================================================
  // GOOGLE CHAT APIs
  // ==========================================================================

  public async listChatSpaces(): Promise<ChatSpaceItem[]> {
    try {
      const data = await this.fetchGoogleApi<{ spaces?: ChatSpaceItem[] }>('https://chat.googleapis.com/v1/spaces?pageSize=20');
      return data.spaces || [];
    } catch (err) {
      console.warn('Chat spaces error:', err);
      return [];
    }
  }

  public async listChatMessages(spaceName: string): Promise<ChatMessageItem[]> {
    const cleanSpace = spaceName.replace(/^\/+/, '');
    const url = `https://chat.googleapis.com/v1/${cleanSpace}/messages?pageSize=30`;
    const data = await this.fetchGoogleApi<{ messages?: ChatMessageItem[] }>(url);
    return (data.messages || []).reverse();
  }

  public async sendChatMessage(spaceName: string, text: string): Promise<ChatMessageItem> {
    const cleanSpace = spaceName.replace(/^\/+/, '');
    const url = `https://chat.googleapis.com/v1/${cleanSpace}/messages`;
    return this.fetchGoogleApi<ChatMessageItem>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
  }

  // ==========================================================================
  // GMAIL APIs
  // ==========================================================================

  public async listGmailMessages(query: string = ''): Promise<GmailMessageItem[]> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15${query ? `&q=${encodeURIComponent(query)}` : ''}`;
    const listRes = await this.fetchGoogleApi<{ messages?: { id: string; threadId: string }[] }>(url);
    
    if (!listRes.messages || listRes.messages.length === 0) {
      return [];
    }

    // Fetch details in parallel for the top messages
    const messagePromises = listRes.messages.slice(0, 10).map(async (m) => {
      try {
        const full = await this.fetchGoogleApi<{
          id: string;
          threadId: string;
          snippet: string;
          internalDate: string;
          labelIds?: string[];
          payload?: {
            headers?: { name: string; value: string }[];
          };
        }>(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);

        const headers = full.payload?.headers || [];
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || new Date(Number(full.internalDate)).toLocaleDateString();

        return {
          id: full.id,
          threadId: full.threadId,
          snippet: full.snippet,
          subject,
          from,
          date,
          internalDate: full.internalDate,
          unread: full.labelIds?.includes('UNREAD') ?? false,
        };
      } catch {
        return {
          id: m.id,
          threadId: m.threadId,
          snippet: '',
          subject: 'Message',
          from: 'Google Workspace',
        };
      }
    });

    return Promise.all(messagePromises);
  }

  public async sendGmailMessage(to: string, subject: string, bodyText: string): Promise<{ id: string }> {
    // Construct RFC 2822 email format and base64url encode
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const emailLines = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyText,
    ];

    const email = emailLines.join('\r\n');
    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.fetchGoogleApi<{ id: string }>('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: base64EncodedEmail })
    });
  }
}

export const googleWorkspace = new GoogleWorkspaceService();
export default googleWorkspace;
