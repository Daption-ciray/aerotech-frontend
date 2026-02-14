# AeroTech Agentic Hub – Frontend

React + Vite frontend. Railway'de Dockerfile ile build edilir ve static olarak serve edilir.

## GitHub'a yükleme

```bash
cd thy-frontend
git init -b main
git add .
git commit -m "Initial frontend repo"
git remote add origin https://github.com/Daption-ciray/aerotech-frontend.git
git push -u origin main
```

(Önce GitHub'da boş repo oluştur: `aerotech-frontend`)

## Railway'de deploy

1. [Railway](https://railway.app) → New Project → Deploy from GitHub repo → `aerotech-frontend` seç.
2. Root Dockerfile kullanılır.
3. **Variables** ekleyin:
   - `VITE_API_URL` = Backend'in public URL'i (örn. `https://aerotech-backend-xxx.railway.app`)
4. Redeploy edin (build sırasında `VITE_API_URL` gerekli).
5. **Settings** → **Networking** → **Generate Domain** ile frontend URL'ini alın.

## Yerel çalıştırma

```bash
npm install
npm run dev
```

Backend farklı porttaysa: `.env` ile `VITE_API_URL=http://localhost:8000` verebilirsiniz.
