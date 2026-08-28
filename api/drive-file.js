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

module.exports = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Parâmetro "id" é obrigatório.' });
    }
    const content = await fetchText(`https://drive.google.com/uc?export=download&id=${id}`);
    res.status(200).json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao buscar arquivo do Google Drive.' });
  }
};