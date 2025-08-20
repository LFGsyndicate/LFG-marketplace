# Деплой LFG to AI (TON Mini‑App) на Vercel + подключение домена + Mini Apps в Telegram

## 1) Подготовка
- Репозиторий: текущий проект, папка `TON_LFG/` — это корень мини‑приложения
- Требуется аккаунт Vercel и GitHub

## 2) Создание проекта на Vercel
1. Зайдите на `https://vercel.com/new` → Import Git Repository
2. Выберите ваш репозиторий (тот же, где лежит `TON_LFG/`)
3. Настройки проекта:
   - Framework Preset: `Vite`
   - Root Directory: `TON_LFG`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Environment Variables (опционально):
     - `VITE_MANIFEST_URL` = `https://<ваш-домен>/tonconnect-manifest.json`
4. Нажмите Deploy

После деплоя получите URL вида `https://<project>-<hash>.vercel.app` — временный домен.

## 3) Проверка манифеста TonConnect
- Откройте `https://<ваш-домен>/tonconnect-manifest.json` — должен отдавать 200 OK
- В файле `TON_LFG/public/tonconnect-manifest.json` убедитесь, что `iconUrl` — абсолютный HTTPS

## 4) Привязка домена
Vercel → Project → Settings → Domains:
1. `Add Domain` → введите домен мини‑приложения (например, `mini.example.com`)
2. Следуйте инструкции Vercel по DNS:
   - Для обычного DNS: создайте CNAME на `cname.vercel-dns.com`
   - Дождитесь статуса `Valid` в Vercel

Примечание по `lfgsyndicate.ton`:
- Если используете TON DNS, а сам сайт хостится на Vercel, нужен шлюз/прокси (мост из TON DNS к HTTPS‑домену) — либо используйте обычный DNS‑поддомен для Mini‑App.

## 5) Включение Mini Apps в Telegram
1. `@BotFather` → `/setdomain` → укажите `https://<ваш-домен>`
2. `/setname`, `/setdescription` — имя и описание
3. Точка входа: `t.me/<ВАШ_БОТ>?startapp`

## 6) Чек‑лист
- [ ] `https://<ваш-домен>` открывает Mini‑App
- [ ] `https://<ваш-домен>/tonconnect-manifest.json` доступен (200 OK)
- [ ] Иконка по ссылке в манифесте доступна
- [ ] Подключение кошелька TonConnect проходит без ошибок
- [ ] Тестовая транзакция уходит на `UQC1WXkJ_7t7sGu6ZTZ9BGoR6YAwtPoKoUf7KZtrgOQ3w7km`

## 7) Команды git (из корня репозитория)
```powershell
cd TON_LFG
git add -A
git commit -m "feat(ton-lfg): mini-app LFG to AI + deploy guide"
git push -u origin main
```
Или через PR:
```powershell
git checkout -b feature/ton-lfg-miniapp
git add -A
git commit -m "feat(ton-lfg): mini-app LFG to AI + deploy guide"
git push -u origin feature/ton-lfg-miniapp
```

## 8) Troubleshooting
- `app manifest error`:
  - Проверьте `VITE_MANIFEST_URL` → продакшен‑URL манифеста
  - В `tonconnect-manifest.json` `url` и `iconUrl` — абсолютные HTTPS
  - Очистите кэш Mini‑App/кошелька и переподключите
- Mini‑App не открывается:
  - Проверьте `/setdomain` у BotFather и SSL на домене
  - Убедитесь, что деплой завершён, а страницы отдают 200 OK
