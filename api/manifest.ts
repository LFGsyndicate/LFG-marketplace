import { VercelRequest, VercelResponse } from '@vercel/node';
import manifest from '../src/tonconnect-manifest.json';

export default (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json(manifest);
};
