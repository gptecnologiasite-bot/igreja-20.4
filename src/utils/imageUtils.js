/**
 * Transform standard Google Drive sharing links into direct image links
 * format: https://drive.google.com/uc?export=download&id=FILE_ID
 */
export const transformImageLink = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern: /file/d/[ID]/view
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      fileId = driveMatch[1];
    } 
    // Pattern: id=[ID]
    else {
      const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // Handle local image folder paths
  if (url.startsWith('imagem/')) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Ensure we don't end up with double slashes if baseUrl ends with /
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return cleanBase + url;
  }

  return url;
};
