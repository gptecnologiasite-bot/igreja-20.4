const https = require('https');

const fetchText = (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
};

const extractChannelId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const channelMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch && channelMatch[1]) return channelMatch[1];
  const handleMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
  if (handleMatch && handleMatch[1]) return '@' + handleMatch[1];
  return null;
};

const resolveChannelId = async (channelUrl) => {
  const extracted = extractChannelId(channelUrl);
  if (!extracted) throw new Error('Link de canal do YouTube inválido.');
  if (extracted.startsWith('UC')) return extracted;
  let html;
  try {
    html = await fetchText(`https://www.youtube.com/${extracted}`);
  } catch {
    throw new Error('Canal do YouTube não encontrado. Verifique o link.');
  }
  const match = html.match(/"channelId":"(UC[^"]+)"/);
  if (match && match[1]) return match[1];
  throw new Error('Não foi possível resolver o ID do canal do YouTube.');
};

const decodeXmlEntities = (str) => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
};

const parseFeed = (xml) => {
  const videos = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let entryMatch;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const videoId = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '';
    const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    const thumbnail = (entry.match(/<media:thumbnail[^>]*url="([^"]+)"/) || [])[1] || '';
    if (videoId) {
      videos.push({
        id: videoId,
        title: decodeXmlEntities(title),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
        date: published
      });
    }
  }
  return { videos: videos.slice(0, 15) };
};

module.exports = async (req, res) => {
  try {
    const channel = req.query.channel;
    if (!channel) {
      return res.status(400).json({ error: 'Parâmetro "channel" é obrigatório.' });
    }
    const channelId = await resolveChannelId(channel);
    let xml;
    try {
      xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    } catch {
      return res.status(404).json({ error: 'Canal do YouTube não encontrado ou sem vídeos públicos. Verifique o link.' });
    }
    const result = parseFeed(xml);
    if (!result.videos.length) {
      return res.status(404).json({ error: 'Nenhum vídeo público encontrado neste canal.' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message || 'Erro ao buscar vídeos do YouTube.' });
  }
};

module.exports.extractChannelId = extractChannelId;
module.exports.resolveChannelId = resolveChannelId;
module.exports.parseFeed = parseFeed;