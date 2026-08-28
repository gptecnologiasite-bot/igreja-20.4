export const getYouTubeVideos = async (channelUrl) => {
  try {
    const res = await fetch('/api/youtube?channel=' + encodeURIComponent(channelUrl));
    const data = await res.json();
    return data || { videos: [] };
  } catch (err) {
    console.error('[Automation] Erro ao buscar vídeos do YouTube:', err);
    return { videos: [] };
  }
};

export const getDriveFiles = async (folderUrl) => {
  try {
    const res = await fetch('/api/drive?folder=' + encodeURIComponent(folderUrl));
    const data = await res.json();
    return data || { files: [] };
  } catch (err) {
    console.error('[Automation] Erro ao buscar arquivos do Drive:', err);
    return { files: [] };
  }
};

export const getDriveTextFile = async (fileId) => {
  try {
    const res = await fetch('/api/drive-file?id=' + encodeURIComponent(fileId));
    const data = await res.json();
    return data || { content: '' };
  } catch (err) {
    console.error('[Automation] Erro ao buscar texto do Drive:', err);
    return { content: '' };
  }
};

export const isImageMime = (mimeType) => typeof mimeType === 'string' && mimeType.startsWith('image/');

export const isVideoMime = (mimeType) => typeof mimeType === 'string' && mimeType.startsWith('video/');

export const isTextMime = (mimeType) => {
  if (typeof mimeType !== 'string') return false;
  if (mimeType.startsWith('text/')) return true;
  if (mimeType === 'application/pdf') return true;
  if (mimeType === 'application/msword') return true;
  if (mimeType.startsWith('application/vnd.openxmlformats-officedocument.')) return true;
  return false;
};

export const getDriveDisplayUrl = (fileId, mimeType) => {
  if (isImageMime(mimeType)) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

export const getYouTubeChannelIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const channelMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch && channelMatch[1]) return channelMatch[1];
  const handleMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
  if (handleMatch && handleMatch[1]) return '@' + handleMatch[1];
  return url;
};