# Deploy LFG AI Market (TON Mini-App) to Vercel + Domain Setup + Telegram Mini Apps

## 1) Preparation
- Repository: current project
- Vercel and GitHub accounts required

## 2) Create Vercel Project
1. Go to `https://vercel.com/new` → Import Git Repository
2. Select your repository
3. Project settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Environment Variables (optional):
     - `VITE_MANIFEST_URL` = `https://<your-domain>/tonconnect-manifest.json`
4. Click Deploy

After deployment you'll get a URL like `https://<project>-<hash>.vercel.app`

## 3) TonConnect Manifest Check
- Open `https://<your-domain>/tonconnect-manifest.json` — should return 200 OK
- In `public/tonconnect-manifest.json` ensure `iconUrl` is absolute HTTPS

## 4) Domain Setup
Vercel → Project → Settings → Domains:
1. `Add Domain` → enter your mini-app domain
2. Follow Vercel DNS instructions:
   - For regular DNS: create CNAME to `cname.vercel-dns.com`
   - Wait for `Valid` status in Vercel

## 5) Enable Mini Apps in Telegram
1. `@BotFather` → `/setdomain` → specify `https://<your-domain>`
2. `/setname`, `/setdescription` — name and description
3. Entry point: `t.me/<YOUR_BOT>?startapp`

## 6) Checklist
- [ ] `https://<your-domain>` opens Mini-App
- [ ] `https://<your-domain>/tonconnect-manifest.json` accessible (200 OK)
- [ ] Icon link in manifest is accessible
- [ ] TonConnect wallet connection works without errors
- [ ] Test transaction works with your wallet address

## 7) Git Commands (from repository root)
```bash
git add -A
git commit -m "feat: LFG AI Market mini-app deployment"
git push origin main
```

## 8) Troubleshooting
- `app manifest error`:
  - Check `VITE_MANIFEST_URL` → production manifest URL
  - In `tonconnect-manifest.json` `url` and `iconUrl` must be absolute HTTPS
  - Clear Mini-App/wallet cache and reconnect
- Mini-App won't open:
  - Check `/setdomain` in BotFather and SSL on domain
  - Ensure deployment is complete and pages return 200 OK
