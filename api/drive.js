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

const extractFolderId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
};

const parseDrivePage = (html) => {
  if (!html || typeof html !== 'string') return { files: [] };
  const patterns = [
    /window\['_DRIVE_ivd'\]\s*=\s*'((?:[^'\\]|\\.)*)'/,
    /window\["_DRIVE_ivd"\]\s*=\s*'((?:[^'\\]|\\.)*)'/,
    /window\['_DRIVE_ivd'\]\s*=\s*"((?:[^"\\]|\\.)*)"/,
    /_DRIVE_ivd\s*=\s*'((?:[^'\\]|\\.)*)'/
  ];
  let raw = null;
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      raw = match[1];
      break;
    }
  }
  if (!raw) return { files: [] };
  const jsonStr = raw.replace(/\\'/g, "'");
  try {
    const parsed = JSON.parse(jsonStr);
    const files = Array.isArray(parsed.files) ? parsed.files : [];
    return { files };
  } catch {
    return { files: [] };
  }
};

module.exports = async (req, res) => {
  try {
    const folder = req.query.folder;
    if (!folder) {
      return res.status(400).json({ error: 'Parâmetro "folder" é obrigatório.' });
    }
    const folderId = extractFolderId(folder);
    if (!folderId) {
      return res.status(400).json({ error: 'Link de pasta do Google Drive inválido.' });
    }
    const html = await fetchText(`https://drive.google.com/drive/folders/${folderId}`);
    if (!html.includes('_DRIVE_ivd')) {
      return res.status(404).json({ error: 'Não foi possível ler a pasta. Verifique se ela está compartilhada como "Qualquer pessoa com o link".' });
    }
    const result = parseDrivePage(html);
    if (!result.files.length) {
      return res.status(404).json({ error: 'A pasta está vazia ou não foi possível listar os arquivos.' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message || 'Erro ao buscar arquivos do Google Drive. Verifique o link da pasta.' });
  }
};

module.exports.extractFolderId = extractFolderId;
module.exports.parseDrivePage = parseDrivePage;