# คู่มือ Deploy ขึ้นเซิร์ฟเวอร์จริง

โปรเจกต์นี้ใช้ **PostgreSQL** เป็นฐานข้อมูล จึง deploy ได้ทั้งบน **Vercel** (serverless, เร็วและง่ายที่สุด)
และ **VPS ของตัวเอง** โดยไม่ต้องแก้โค้ดต่างกันเลย — เลือกทางที่เหมาะกับคุณได้จาก 2 หัวข้อด้านล่าง

---

## ทางเลือกที่ 1: Vercel + Postgres (แนะนำ — เร็วที่สุด)

### 1. สมัคร Postgres ฟรี

เลือกผู้ให้บริการใดก็ได้ (ทำงานเหมือนกันหมด เพราะโค้ดใช้ Postgres มาตรฐาน):
- **[neon.tech](https://neon.tech)** — free tier ใจกว้าง, serverless-friendly (แนะนำ)
- **[supabase.com](https://supabase.com)** — free tier + มี dashboard จัดการข้อมูลในตัว
- **[railway.app](https://railway.app)** — ตั้งค่าไว ใช้ credit ฟรีช่วงทดลอง

สมัครเสร็จแล้วคัดลอก **Connection String** (หน้าตาแบบ `postgresql://user:pass@host:5432/db`)

> 💡 **สำคัญสำหรับ Vercel**: ถ้าผู้ให้บริการมี connection string แบบ "pooled" แยกต่างหาก
> (เช่น Neon จะมี host ที่ลงท้ายด้วย `-pooler`) ให้ใช้ตัวนั้นแทนตัวปกติ เพราะ Vercel รัน
> serverless function หลายตัวพร้อมกัน การใช้ connection ตรงแบบไม่ pool อาจทำให้ฐานข้อมูล
> connection เต็มได้เร็ว

### 2. Push โค้ดขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Import เข้า Vercel

1. เข้า [vercel.com](https://vercel.com) → **Add New Project** → เลือก repo ที่เพิ่ง push
2. Vercel จะตรวจพบว่าเป็นโปรเจกต์ Next.js อัตโนมัติ ไม่ต้องแก้ Build settings

### 4. ตั้งค่า Environment Variables

ในหน้า **Settings → Environment Variables** ของโปรเจกต์บน Vercel ใส่ค่าเหล่านี้:

| ตัวแปร | ค่าที่ใส่ |
|---|---|
| `DATABASE_URL` | connection string จากขั้นตอนที่ 1 (ใช้ตัว pooled ถ้ามี) |
| `ADMIN_EMAIL` | อีเมลแอดมินจริงของคุณ |
| `ADMIN_PASSWORD` | รหัสผ่านที่คาดเดายาก |
| `SESSION_SECRET` | สุ่มสตริงยาวๆ (รันคำสั่ง `openssl rand -base64 32` ในเครื่องเพื่อสร้าง) |
| `RESEND_API_KEY` | (ไม่บังคับ) คีย์จาก resend.com ถ้าต้องการส่งอีเมลจริง |
| `EMAIL_FROM` | (ไม่บังคับ) เช่น `Tours <no-reply@yourdomain.com>` |
| `ADMIN_NOTIFY_EMAIL` | (ไม่บังคับ) อีเมลรับแจ้งเตือนการจอง/ข้อความใหม่ |

### 5. Deploy

กด **Deploy** — Vercel จะ build และ deploy ให้อัตโนมัติ พอเปิดเว็บครั้งแรก ระบบจะสร้างตาราง
ฐานข้อมูลทั้งหมดและผู้ดูแลระบบคนแรกให้เองทันที (ไม่ต้องรันคำสั่ง migrate ใดๆ)

### 6. ต่อโดเมนของตัวเอง (ถ้ามี)

ไปที่ **Settings → Domains** ของโปรเจกต์ใน Vercel แล้วเพิ่มโดเมน ทำตามคำแนะนำเรื่อง DNS
ที่ Vercel แสดงให้ (ปกติแค่เพิ่ม CNAME/A record ที่ผู้ให้บริการโดเมน) — Vercel จัดการ SSL ให้อัตโนมัติ

### อัปเดตโค้ดครั้งต่อไป

แค่ `git push` ขึ้น branch ที่ตั้งไว้ (ปกติคือ `main`) Vercel จะ deploy เวอร์ชันใหม่ให้อัตโนมัติ

---

## ทางเลือกที่ 2: VPS ของตัวเอง

เหมาะถ้าต้องการควบคุมเซิร์ฟเวอร์เอง หรือมี VPS อยู่แล้ว ใช้ได้กับ DigitalOcean, Vultr,
AWS Lightsail, Linode หรือผู้ให้บริการ VPS ไทยก็ได้เช่นกัน

### ข้อกำหนด
- VPS รัน **Ubuntu 22.04 หรือ 24.04** อย่างน้อย 1 vCPU / 1GB RAM
- โดเมนที่ชี้ (DNS A record) มาที่ IP เซิร์ฟเวอร์แล้ว (ถ้ายังไม่มี ข้าม SSL ไปก่อนได้)
- ฐานข้อมูล Postgres — จะติดตั้งในเครื่องเดียวกัน หรือใช้ Neon/Supabase จากภายนอกก็ได้

### 1. ติดตั้ง Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

### 2. ติดตั้ง PostgreSQL (ถ้าจะรันในเครื่องเดียวกัน)

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE tourdb;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'เลือกรหัสผ่านที่นี่';"
```
Connection string ที่ได้: `postgresql://postgres:รหัสผ่าน@localhost:5432/tourdb`

> ถ้าจะใช้ Neon/Supabase แทน ข้ามขั้นตอนนี้ไปเลย แล้วใช้ connection string จากที่นั่น

### 3. ติดตั้งเครื่องมืออื่นๆ

```bash
sudo apt-get update
sudo apt-get install -y git nginx
sudo npm install -g pm2
```

### 4. ดึงโค้ดขึ้นเซิร์ฟเวอร์

```bash
cd /var/www
git clone <your-repo-url> tour-booking-system
cd tour-booking-system
npm install
cp .env.example .env.local
nano .env.local   # ใส่ DATABASE_URL และค่าอื่นๆ ตามจริง
```

### 5. Build และรันด้วย PM2

```bash
npm run build
pm2 start npm --name "tour-site" -- run start -- -p 3000
pm2 save
pm2 startup   # ทำตามคำสั่งที่แสดงออกมา ให้รันอัตโนมัติเมื่อเซิร์ฟเวอร์รีสตาร์ท
```

ตรวจสอบว่ารันอยู่: `pm2 status` และ `curl http://localhost:3000`

### 6. ตั้งค่า Nginx เป็น reverse proxy

สร้างไฟล์ `/etc/nginx/sites-available/tour-site`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tour-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. ติดตั้ง SSL ฟรีด้วย Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run   # ทดสอบว่า auto-renew ทำงาน
```

เว็บควรเข้าถึงได้ที่ `https://yourdomain.com` แล้ว 🎉

### อัปเดตโค้ดครั้งต่อไป

```bash
cd /var/www/tour-booking-system
git pull
npm install
npm run build
pm2 restart tour-site
```

### สำรองข้อมูล (Backup)

ถ้ารัน Postgres ในเครื่องเดียวกัน ตั้ง cron สำรองข้อมูลทุกวัน:
```bash
crontab -e
# เพิ่มบรรทัดนี้ (แก้รหัสผ่าน/ชื่อฐานข้อมูลตามจริง):
0 0 * * * PGPASSWORD=รหัสผ่าน pg_dump -U postgres -h localhost tourdb > /var/backups/tourdb-$(date +\%F).sql
```
ถ้าใช้ Neon/Supabase ผู้ให้บริการมักมีระบบ backup อัตโนมัติให้อยู่แล้ว — เช็คในหน้า dashboard

---

## 🔍 แก้ปัญหาเบื้องต้น

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
|---|---|---|
| หน้าเว็บขึ้น error ตอนโหลด | `DATABASE_URL` ไม่ถูกต้องหรือยังไม่ตั้งค่า | เช็ค connection string อีกครั้ง และตรวจว่า IP/เครือข่ายเข้าถึงฐานข้อมูลได้ |
| เว็บขึ้น 502 Bad Gateway (VPS) | แอปยังไม่รัน หรือรันคนละพอร์ต | `pm2 status` แล้วเช็คว่ารันที่พอร์ต 3000 ตรงกับ Nginx config |
| อีเมลไม่ถูกส่ง | ยังไม่ตั้ง `RESEND_API_KEY` | ตรวจสอบ environment variables แล้ว restart แอป |
| ล็อกอินหลังบ้านไม่ได้ | ลืมรหัสที่ตั้งใน `ADMIN_EMAIL`/`ADMIN_PASSWORD` | ค่านี้ใช้แค่ตอนสร้างแอดมินคนแรก (ตาราง `admin_users` ว่างเปล่า) ถ้าลืมรหัส ให้ต่อฐานข้อมูลโดยตรงแล้วอัปเดตแถวใน `admin_users` หรือลบแถวนั้นแล้วรีสตาร์ทแอปเพื่อให้สร้างใหม่ |
| Connection เต็ม / timeout บน Vercel | ใช้ connection string แบบไม่ pooled | เปลี่ยนไปใช้ pooled connection string ของผู้ให้บริการ (ดูหัวข้อ Vercel ด้านบน) |
