# Handcraft Store

A self-hosted ecommerce platform for handcrafted and personalized goods.
Pull the image, set your variables, and it runs. No manual scripts, no extra setup steps.

---

## How it works

On first start the container automatically:

1. Seeds default categories, products, and settings into MongoDB
2. Creates your admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. Generates `sitemap.xml` and `robots.txt`
4. Starts the web server

All steps are **idempotent** — safe to restart at any time. Existing records are never overwritten.

Once the health check passes (~60 seconds on first start) the store is live.

---

## Quick start

```bash
# 1. Download the config files
curl -L https://github.com/acidrs03/webstore/archive/refs/heads/main.tar.gz | tar xz --strip=1

# 2. Create your .env
cp .env.example .env
nano .env          # fill in required values — see table below

# 3. Start
docker compose up -d

# 4. Check it's healthy
docker compose ps  # store_app should show "Up (healthy)" after ~60s
```

Then open `http://<your-server-ip>:3000` in a browser (or your `APP_PORT` if changed).
Admin panel: `http://<your-server-ip>:3000/admin`

---

## Environment variables

Copy `.env.example` to `.env` and set these values. Required variables are marked **bold**.

### Core

| Variable | Required | Default | What it does |
|---|---|---|---|
| **`MONGODB_URI`** | Yes | — | Connection string for your MongoDB container. See [MongoDB setup](#mongodb-setup) below. |
| **`SESSION_SECRET`** | Yes | — | Long random string for signing session cookies. Generate with the command below. |
| **`STRIPE_SECRET_KEY`** | Yes | — | Stripe secret key — `sk_live_...` for production, `sk_test_...` for testing. |
| **`STRIPE_PUBLISHABLE_KEY`** | Yes | — | Stripe publishable key — `pk_live_...` or `pk_test_...`. |
| **`STRIPE_WEBHOOK_SECRET`** | Yes | — | Signing secret from Stripe Dashboard. See [Stripe webhook](#stripe-webhook) below. |
| **`BASE_URL`** | Yes | — | Full public URL of your store. No trailing slash. e.g. `https://shop.yourdomain.com` or `http://192.168.1.100:3000` for local testing. |
| **`ADMIN_EMAIL`** | Yes | — | Email address for the admin login account (created on first start). |
| **`ADMIN_PASSWORD`** | Yes | — | Password for the admin account. Use a strong password. |
| `SITE_NAME` | No | `My Store` | Your store's display name — shown in the browser tab, admin panel, and emails. |
| `DOCKER_IMAGE` | No | `webstore:latest` | Docker Hub image to pull. Set to `yourdockerhubuser/webstore:latest`. |

### Ports

| Variable | Required | Default | What it does |
|---|---|---|---|
| `APP_PORT` | No | `3000` | **Host port** the app binds to. This is the port you point Nginx Proxy Manager at. Change it if 3000 is already in use on your host. |
| `PORT` | No | `3000` | Internal Node.js port inside the container. **Do not change this.** Must match `APP_PORT`'s container side. |

### Paths (persistent data)

| Variable | Required | Default | What it does |
|---|---|---|---|
| `APPDATA_PATH` | No | `/mnt/user/appdata/webstore` | Base directory on your **host** where uploads and logs are stored. See [path setup](#path-setup) below. |
| `UPLOAD_DIR` | No | `./uploads` | Upload directory inside the container. **Do not change this.** |
| `MAX_FILE_SIZE` | No | `10485760` | Maximum upload size in bytes. Default is 10 MB. |

### Backup scripts (optional)

| Variable | Required | Default | What it does |
|---|---|---|---|
| `MONGO_CONTAINER` | No | `my_mongo` | Name of your MongoDB Docker container — used by `scripts/backup.sh` and `scripts/restore.sh` only. |
| `DB_NAME` | No | `my_store` | Database name — used by backup scripts only. Must match the database in your `MONGODB_URI`. |

---

## MongoDB setup

The store connects to your existing MongoDB container. Set `MONGODB_URI` in `.env`:

```bash
# MongoDB on the same Docker network — use the container name
MONGODB_URI=mongodb://my_mongo_container:27017/my_store

# MongoDB on a different network or a host IP
MONGODB_URI=mongodb://192.168.1.100:27017/my_store

# With authentication
MONGODB_URI=mongodb://username:password@192.168.1.100:27017/my_store
```

The database (`my_store` in the examples above) is created automatically on first start.

**If your MongoDB container is on a named Docker network** (not the default bridge), uncomment the external network block at the bottom of `docker-compose.yml` and add that network to the `app` service. Find your network name with `docker network ls`.

---

## Path setup

`APPDATA_PATH` is the directory on your **host machine** where the container stores uploaded images and logs. It is mounted into the container as a volume so your data survives container restarts and image updates.

**The container pre-creates all required subdirectories inside the image.** You do not need to create them in advance.

| Setup | Value to use |
|---|---|
| Unraid (appdata share) | `APPDATA_PATH=/mnt/user/appdata/webstore` |
| Linux / VPS | `APPDATA_PATH=/opt/webstore` |
| Local testing | `APPDATA_PATH=/tmp/webstore` |

The full volume mappings are:

| Inside container | Host path |
|---|---|
| `/app/uploads` | `$APPDATA_PATH/uploads` |
| `/app/logs` | `$APPDATA_PATH/logs` |

---

## Unraid setup

### Method A — Docker Compose Manager (recommended)

1. Install the **Docker Compose Manager** community app from the Unraid App Store.
2. Copy the contents of this folder to `/mnt/user/appdata/webstore/` on your Unraid server (via WinSCP, Unraid's file manager, or `rsync`).
3. In Compose Manager, point it at `/mnt/user/appdata/webstore/docker-compose.yml`.
4. Create your `.env` file at `/mnt/user/appdata/webstore/.env` and fill in the values.
5. Click **Up** in Compose Manager.

### Method B — Unraid Docker GUI (manual container setup)

If you add the container through Unraid's Docker tab directly, configure it as follows:

**Repository:** `yourdockerhubuser/webstore:latest`

**Environment variables** — add each as a Variable:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb://your-mongo-container:27017/my_store` |
| `SESSION_SECRET` | *(your generated secret)* |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `BASE_URL` | `https://yourdomain.com` |
| `SITE_NAME` | `My Store` |
| `ADMIN_EMAIL` | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | *(strong password)* |

**Port mappings** — add as a Port:

| Container port | Host port | Protocol |
|---|---|---|
| `3000` | `3000` (or your preferred host port) | TCP |

> Note: Point Nginx Proxy Manager at this host port. No separate Nginx container is needed.

**Volume mappings** — add as a Path:

| Container path | Host path | Access mode |
|---|---|---|
| `/app/uploads` | `/mnt/user/appdata/webstore/uploads` | Read/Write |
| `/app/logs` | `/mnt/user/appdata/webstore/logs` | Read/Write |

---

## Port reference

| Port | Where | What |
|---|---|---|
| `3000` (default, host) | Your host machine | HTTP access to the store. Point Nginx Proxy Manager here. Set with `APP_PORT`. |
| `3000` (internal) | Inside `store_app` container | Node.js app listening port. |

---

## Generating a session secret

Run once to generate a secure random string for `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Without Node installed on your host:

```bash
docker run --rm node:18-alpine node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output as the value of `SESSION_SECRET` in your `.env`. The hex output will never contain `$` so no escaping is needed.

---

## SSL / HTTPS

The app container listens on HTTP only. Use Nginx Proxy Manager to terminate HTTPS.

**With Nginx Proxy Manager** (recommended):

1. Install **Nginx Proxy Manager** from the Unraid App Store (or run it as a standalone container).
2. Open it at `http://<unraid-ip>:81`.
3. Add a **Proxy Host**:
   - Domain: `shop.yourdomain.com`
   - Scheme: `http`
   - Forward Hostname/IP: `<unraid-ip>` (or `localhost` if on the same machine)
   - Forward Port: `3000` (your `APP_PORT`)
   - Enable Websockets Support: on
4. On the **SSL** tab: request a Let's Encrypt certificate.
5. Update `BASE_URL` in `.env` to `https://shop.yourdomain.com`, then restart:
   ```bash
   docker compose restart app
   ```

---

## Stripe webhook

In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks):

- **Endpoint URL:** `https://shop.yourdomain.com/webhooks/stripe`
- **Events to listen for:**
  - `checkout.session.completed`
  - `payment_intent.payment_failed`

Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET` in `.env`, then:

```bash
docker compose restart app
```

---

## Updating to a new image version

```bash
docker compose pull app
docker compose up -d app
```

The entrypoint re-runs the seed scripts on every start — they skip records that already exist, so no data is lost.

---

## Day-to-day operations

```bash
# View live logs
docker compose logs -f app

# Restart the app
docker compose restart app

# Stop everything
docker compose down

# Regenerate sitemap after adding products
docker compose exec app node src/scripts/generateSitemap.js
```

---

## Backups

```bash
# Manual backup (MongoDB dump + uploads archive)
bash scripts/backup.sh

# Restore from a backup
bash scripts/restore.sh ./backups/20240115_020000
```

Set `MONGO_CONTAINER` and `DB_NAME` in `.env` to match your MongoDB setup before running these.

### Schedule daily backups on Unraid (cron)

```bash
crontab -e
```

Add (runs at 2:00 AM daily):

```
0 2 * * * MONGO_CONTAINER=my_mongo DB_NAME=my_store /bin/bash /mnt/user/appdata/webstore/scripts/backup.sh >> /mnt/user/appdata/webstore/logs/backup.log 2>&1
```

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Container exits immediately on start | `docker logs store_app` — likely a missing required `.env` variable |
| App stuck starting / health check failing | `MONGODB_URI` wrong or MongoDB unreachable. Test: `docker exec store_app node -e "require('mongoose').connect(process.env.MONGODB_URI).then(()=>console.log('ok'))"` |
| `502 Bad Gateway` from NPM | App not healthy yet — wait 60s. Check `docker logs store_app`. Verify NPM is pointing at the correct host port (`APP_PORT`). |
| Stripe checkout not working | Verify `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` are set correctly |
| Stripe webhooks failing | Webhook URL must be your public `https://` domain. Verify `STRIPE_WEBHOOK_SECRET` matches the Stripe Dashboard signing secret |
| Images not loading on storefront | Check `APPDATA_PATH/uploads` is writable on the host |
| Can't log into admin | Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. Re-seed: `docker compose exec app node src/scripts/seedAdmin.js` |
| Session lost after restart | `SESSION_SECRET` must be a fixed value — not randomly generated on each start |
| Changes to `.env` not taking effect | `docker compose up -d` (restarts affected containers) |
| `$ variable is not set` warning | A value in `.env` contains a literal `$`. Escape it as `$$`. See `.env.example` header. |

---

## Features

| Feature | Status |
|---|---|
| Product catalog with categories | ✓ Included |
| Admin panel — products, orders, categories, settings | ✓ Included |
| Stripe checkout (guest, no account required) | ✓ Included |
| Custom order requests | ✓ Included |
| Theme customisation (colours, fonts) | ✓ Included |
| Maintenance mode | ✓ Included |
| SEO — sitemap.xml, robots.txt, Open Graph, JSON-LD | ✓ Included |
| Image uploads | ✓ Included |
| Shipping methods admin | ✓ Included |
| Email notifications | Stub — logs only. Wire up Nodemailer/SendGrid in `emailService.js` |
| Customer accounts / order history | Not built — guest checkout only |
| Discount / coupon codes | Not built |
| Inventory decrement on order | Not built (fields exist on the Product model) |
| Order tracking numbers | Not built |
