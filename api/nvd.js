export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
 
  try {
    const now = new Date();
    const from = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const start = from.toISOString().split('T')[0] + 'T00:00:00.000';
    const end = now.toISOString().split('T')[0] + 'T23:59:59.000';
 
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL&pubStartDate=${start}&pubEndDate=${end}&resultsPerPage=8`;
 
    const response = await fetch(url, {
      headers: { 'User-Agent': 'DigitalWacht-Dashboard/1.0' }
    });
 
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
 
