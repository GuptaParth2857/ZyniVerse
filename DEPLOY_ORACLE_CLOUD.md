# ZyniVerse — Oracle Cloud Free Tier Deployment Guide

Your app is too heavy for Vercel Hobby / Railway free tiers (usage keeps exceeding limits).
This guide deploys it on **Oracle Cloud Always-Free VPS** — no credit card, no time limit,
no usage caps. Socket.io + Next.js now run on ONE server via `server.ts`.

## 1. Create Oracle Cloud account

1. Go to https://www.oracle.com/cloud/free/
2. Sign up (requires a real credit/debit card for verification, but you are NOT charged)
3. After signup, go to **Compute → Instances → Create Instance**

## 2. Create a free ARM instance

- **Image**: Ubuntu 22.04 (or 24.04)
- **Shape**: Choose "Ampere A1 Flex" → **4 OCPUs / 24 GB RAM** (this is the free tier)
- **Boot volume**: 100 GB (free)
- Add your **SSH public key**
- Click **Create**

> Note: If the always-free ARM shape shows "out of capacity", select only 1 OCPU / 6GB or 2 OCPU / 12GB.

## 3. Open ports

In the instance's **Security List / NSG**, open inbound ports:
- `22` (SSH)
- `80` (HTTP)
- `443` (HTTPS)
- `3000` (app — you can keep it firewall-internal and use nginx for 80/443)

## 4. SSH in and install Docker

```bash
ssh ubuntu@<YOUR_INSTANCE_IP>

sudo apt update
sudo apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# log out and back in for group to apply
exit
```

## 5. Upload the project

From your local machine:

```bash
cd "C:\Users\Parth Gupta\Desktop\ZyniVerse"
git init && git add -A && git commit -m "deploy"
# OR use scp / rsync
scp -r ./ ubuntu@<YOUR_INSTANCE_IP>:~/zyniverse
```

Make sure you exclude `node_modules` and `.next` (they get rebuilt in Docker).

## 6. Configure environment

On the server, create the production env file:

```bash
cd ~/zyniverse
cp .env.production .env.production.local
nano .env.production.local
```

Edit **at minimum**:
- `NEXT_PUBLIC_BASE_URL=https://zyverse.in` (or your domain)
- `AUTH_SECRET` (generate a new random one: `openssl rand -base64 32`)
- `DM_BROADCAST_TOKEN` (generate: `openssl rand -hex 32`)
- `DATABASE_URL` / `DIRECT_URL` (your Supabase connection string — already filled)
- All other keys are filled from your existing `.env`

## 7. Build and run

```bash
docker compose --env-file .env.production.local build
docker compose --env-file .env.production.local up -d
```

Check it works:

```bash
curl http://localhost:3000/health   # should return {"status":"ok"}
```

## 8. Nginx reverse proxy (HTTP + HTTPS)

Create nginx config so domain → app:

```bash
sudo tee /etc/nginx/sites-available/zyverse <<'EOF'
server {
    listen 80;
    server_name zyverse.in www.zyverse.in;

    client_max_body_size 250m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/zyverse /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Enable HTTPS (free)

```bash
sudo certbot --nginx -d zyverse.in -d www.zyverse.in
```

## 10. Point your domain (DNS)

At your DNS provider, set:
- `A` record: `zyverse.in` → your VPS IP
- `A` record: `www.zyverse.in` → your VPS IP

Done! Your site runs forever on free infrastructure with no usage limits.

---

## Helpful commands

```bash
docker compose --env-file .env.production.local logs -f app   # live logs
docker compose --env-file .env.production.local up -d --build # rebuild & restart
docker compose --env-file .env.production.local down          # stop
```

## Auto-restart

The `restart: unless-stopped` in docker-compose.yml + Docker's restart policy means
the app auto-restarts on crashes and on boot. Combined with nginx + systemd, the
site stays up permanently with no manual intervention.
