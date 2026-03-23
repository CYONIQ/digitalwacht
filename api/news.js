export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Versuche mehrere Security News Feeds
    const feeds = [
      'https://thehackernews.com/feeds/posts/default',
      'https://feeds.feedburner.com/TheHackersNews',
      'https://www.bleepingcomputer.com/feed/',
    ];

    let xml = '';
    for (const url of feeds) {
      try {
        const r = await fetch(url, { headers: { 'User-Agent': 'DigitalWacht-Dashboard/1.0' } });
        if (r.ok) { xml = await r.text(); break; }
      } catch(e) { continue; }
    }

    if (!xml) return res.status(200).json({ items: [] });

    const items = [];
    const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g);
    for (const match of matches) {
      const block = match[1] || match[2];
      const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                         block.match(/<title[^>]*>(.*?)<\/title>/s);
      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        if (title) items.push({ title });
      }
      if (items.length >= 10) break;
    }

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
