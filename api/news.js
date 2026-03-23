export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://feeds.feedburner.com/TheHackersNews', {
      headers: { 'User-Agent': 'DigitalWacht-Dashboard/1.0' }
    });
    const xml = await response.text();

    // Parse RSS titles und links
    const items = [];
    const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of matches) {
      const titleMatch = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                         match[1].match(/<title>(.*?)<\/title>/);
      const linkMatch  = match[1].match(/<link>(.*?)<\/link>/);
      const dateMatch  = match[1].match(/<pubDate>(.*?)<\/pubDate>/);
      if (titleMatch) {
        items.push({
          title: titleMatch[1].trim(),
          link:  linkMatch  ? linkMatch[1].trim()  : '#',
          date:  dateMatch  ? dateMatch[1].trim()  : '',
        });
      }
      if (items.length >= 10) break;
    }

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
