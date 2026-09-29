/**
 * Media and Google Drive Embed Utility
 * Supports YouTube, Vimeo, Google Drive (Files, Folders, Docs, Sheets, Slides), and Direct Video Streams.
 */

export interface GoogleDriveEmbedInfo {
  isDrive: boolean;
  type: 'file' | 'folder' | 'doc' | 'sheet' | 'slide' | 'none';
  id?: string;
  embedUrl?: string;
  directUrl?: string;
}

export type VideoEmbedType = 'youtube' | 'vimeo' | 'googledrive' | 'googledrive-folder' | 'video' | 'none';

export interface VideoEmbedResult {
  type: VideoEmbedType;
  embedUrl: string;
  originalUrl: string;
  driveInfo?: GoogleDriveEmbedInfo;
}

/**
 * Parses and extracts Google Drive identifiers and produces embeddable iframe URLs.
 */
export function parseGoogleDriveUrl(url?: string): GoogleDriveEmbedInfo {
  if (!url || typeof url !== 'string') return { isDrive: false, type: 'none' };
  const trimmed = url.trim();
  if (!trimmed) return { isDrive: false, type: 'none' };

  // 1. Google Drive Folder match:
  // e.g. https://drive.google.com/drive/folders/1aBcDeF... or .../u/0/folders/1aBcDeF...
  const folderMatch = trimmed.match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/|folderview\?id=)([a-zA-Z0-9_-]{15,})/i);
  if (folderMatch && folderMatch[1]) {
    const id = folderMatch[1];
    return {
      isDrive: true,
      type: 'folder',
      id,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${id}#list`,
      directUrl: `https://drive.google.com/drive/folders/${id}`
    };
  }

  // 2. Google Docs Document:
  const docMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (docMatch && docMatch[1]) {
    const id = docMatch[1];
    return {
      isDrive: true,
      type: 'doc',
      id,
      embedUrl: `https://docs.google.com/document/d/${id}/preview`,
      directUrl: `https://docs.google.com/document/d/${id}/edit`
    };
  }

  // 3. Google Spreadsheets:
  const sheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (sheetMatch && sheetMatch[1]) {
    const id = sheetMatch[1];
    return {
      isDrive: true,
      type: 'sheet',
      id,
      embedUrl: `https://docs.google.com/spreadsheets/d/${id}/preview`,
      directUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`
    };
  }

  // 4. Google Presentations / Slides:
  const slideMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (slideMatch && slideMatch[1]) {
    const id = slideMatch[1];
    return {
      isDrive: true,
      type: 'slide',
      id,
      embedUrl: `https://docs.google.com/presentation/d/${id}/embed`,
      directUrl: `https://docs.google.com/presentation/d/${id}/edit`
    };
  }

  // 5. Google Drive File (Videos, Audio, PDFs, zip, etc.)
  // e.g. https://drive.google.com/file/d/1aBcDeF.../view?usp=sharing
  // or https://drive.google.com/open?id=1aBcDeF...
  // or https://drive.google.com/uc?id=1aBcDeF...
  const fileMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{15,})/i);
  if (fileMatch && fileMatch[1]) {
    const id = fileMatch[1];
    return {
      isDrive: true,
      type: 'file',
      id,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      directUrl: `https://drive.google.com/file/d/${id}/view`
    };
  }

  return { isDrive: false, type: 'none' };
}

/**
 * Checks whether a URL is a Google Drive link.
 */
export function isGoogleDriveUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com|docs\.google\.com/.test(url);
}

/**
 * Unified embed URL resolver for YouTube, Vimeo, Google Drive, and HTML5 video.
 */
export function getVideoEmbedUrl(url?: string): VideoEmbedResult {
  if (!url || typeof url !== 'string') {
    return { type: 'none', embedUrl: '', originalUrl: '' };
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return { type: 'none', embedUrl: '', originalUrl: '' };
  }

  // 1. Check Google Drive first
  const driveInfo = parseGoogleDriveUrl(trimmed);
  if (driveInfo.isDrive && driveInfo.embedUrl) {
    return {
      type: driveInfo.type === 'folder' ? 'googledrive-folder' : 'googledrive',
      embedUrl: driveInfo.embedUrl,
      originalUrl: trimmed,
      driveInfo
    };
  }

  // 2. YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { 
      type: 'youtube', 
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      originalUrl: trimmed
    };
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { 
      type: 'vimeo', 
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      originalUrl: trimmed
    };
  }

  // 4. Direct video file or cloud storage URL
  return { 
    type: 'video', 
    embedUrl: trimmed,
    originalUrl: trimmed
  };
}
