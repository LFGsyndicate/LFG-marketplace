import { VercelRequest, VercelResponse } from '@vercel/node';

export default (req: VercelRequest, res: VercelResponse) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  
  const manifest = {
    "url": baseUrl,
    "name": "LFG AI Market",
    "iconUrl": `${baseUrl}/icon.png`,
    "termsOfUseUrl": `${baseUrl}/api/terms`,
    "privacyPolicyUrl": `${baseUrl}/api/privacy`
  };
  
  // Add CORS headers for wallet compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  res.status(200).json(manifest);
};
