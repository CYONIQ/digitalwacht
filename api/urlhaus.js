export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // URLhaus JSON API mit echten Tags
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/100/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DigitalWacht-Dashboard/1.0'
      },
      body: ''
    });
    const data = await response.json();

    if (data.urls && data.urls.length > 0) {
      return res.status(200).json(data);
    }

    // Fallback: plain text list
    const txt = await fetch('https://urlhaus.abuse.ch/downloads/text_recent/', {
      headers: { 'User-Agent': 'DigitalWacht-Dashboard/1.0' }
    });
    const text = await txt.text();
    const urls = text
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .slice(0, 100)
      .map(url => {
        const u = url.trim().toLowerCase();
        let threat = 'malware_download';
        if (u.includes('verification') || u.includes('login') || u.includes('signin') || u.includes('secure') || u.includes('account')) threat = 'phishing';
        else if (u.includes('.exe') || u.includes('.dll') || u.includes('.msi')) threat = 'windows_exe';
        else if (u.includes('.sh') || u.includes('/bin/')) threat = 'shell_script';
        else if (u.includes('miner') || u.includes('xmr')) threat = 'cryptominer';
        else if (u.includes('loader') || u.includes('bot') || u.includes('payload')) threat = 'botnet_loader';
        else if (u.includes('.ps1')) threat = 'powershell';
        return {
          url: url.trim(),
          url_status: 'online',
          date_added: new Date().toISOString().split('T')[0],
          threat,
          tags: [threat],
        };
      });
    res.status(200).json({ query_status: 'ok', urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
