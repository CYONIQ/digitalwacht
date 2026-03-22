export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://urlhaus.abuse.ch/downloads/json_recent/', {
      method: 'GET',
    });
    const text = await response.text();
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : Object.values(data);
    res.status(200).json({ urls: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
