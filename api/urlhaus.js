export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Plain-text URL list - kein Auth-Key nötig
    const response = await fetch('https://urlhaus.abuse.ch/downloads/text_recent/', {
      method: 'GET',
      headers: { 'User-Agent': 'DigitalWacht-Dashboard/1.0' }
    });
    const text = await response.text();
    
    // Format: eine URL pro Zeile, Kommentare mit #
    const urls = text
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .slice(0, 100)
      .map((url, i) => ({
        url: url.trim(),
        url_status: 'online',
        date_added: new Date().toISOString().split('T')[0],
        threat: 'malware_download',
        tags: [],
      }));

    res.status(200).json({ query_status: 'ok', urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
