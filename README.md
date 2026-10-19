# ระบบบริหารจัดการกิจกรรม (Event Management System)

## 1. ข้อมูลโครงงาน

| รายการ | รายละเอียด |
| --- | --- |
| รายวิชา | **7153403 เทคโนโลยีการบริการเว็บ** |
| งาน | Final Examination — การสอบปลายภาค |
| ภาคเรียน / ปีการศึกษา | **1/2569** |
| ชุดโจทย์ | **D — กิจกรรม** |
| Repository | `674259009_7153403_Final_4` |
| รหัสนักศึกษา | `674259009` |
| ผู้จัดทำ |นรงศ์ศักดิ์ ภูมิประเสริฐ |

เอกสารนี้จัดทำจากซอร์สโค้ดและ configuration ใน repository เมื่อวันที่ 19 ตุลาคม 2569 โดยแยกการมี implementation ออกจากผลทดสอบการทำงานจริง

> **การใช้ Frontend:** โครงการใช้ **Next.js App Router + React** แทน React + Vite โดยผู้จัดทำยืนยันว่าได้สอบถามอาจารย์และได้รับอนุญาตแล้ว จึงใช้ Next.js ต่อไปได้โดยไม่ต้องย้าย framework

Backend ปรับให้ DELETE ตอบ **200** และรองรับ search/category filtering ผ่าน query parameters แล้วใน working tree; Production ที่ตรวจยังเป็นเวอร์ชันเดิม

## 2. ภาพรวมโครงงาน

ระบบใช้บันทึกและบริหารกิจกรรมประเภท **อบรม สัมมนา และจิตอาสา** ผู้ใช้สามารถดูรายการและรายละเอียด เพิ่ม แก้ไข ลบกิจกรรม และกำหนดสถานะเผยแพร่หรือฉบับร่างได้ ข้อมูลถูกอ่านและเขียนผ่าน REST API ไปยัง PostgreSQL ด้วย Sequelize ไม่ใช่ข้อมูลจำลองที่เก็บเฉพาะในหน่วยความจำหรือ browser

หน้าจอมีภาพรวมจำนวนกิจกรรม กิจกรรมที่กำลังจะมาถึง การค้นหาจากชื่อกิจกรรมหรือผู้จัด การกรองหมวดหมู่และสถานะ และการเรียงตามวันที่หรือชื่อ การค้นหาชื่อ/ผู้จัดและกรองหมวดหมู่ทำผ่าน Backend แล้ว Frontend ยังตรวจกรองซ้ำเพื่อรองรับ API รุ่นเดิม ส่วนการกรองสถานะทำที่ Frontend รายละเอียดและฟอร์มเปิดเป็น dialog บนหน้า `/` ไม่ได้มี URL แยกสำหรับแต่ละหน้า

### การใช้งานระบบออนไลน์ (Live Demo)

| บริการ | ลิงก์ |
| --- | --- |
| ระบบออนไลน์ — Vercel | [เปิดระบบบริหารจัดการกิจกรรม](https://674259009-7153403-final-d.vercel.app/) |
| Backend — Render | [Backend Base URL](https://event-backend-5m5f.onrender.com) |
| Events API | [GET /api/events](https://event-backend-5m5f.onrender.com/api/events) |
| Swagger API Documentation | [Swagger UI — getEvents](https://event-backend-5m5f.onrender.com/api/events/docs#/Events/getEvents) |
| OpenAPI JSON | [API specification](https://event-backend-5m5f.onrender.com/api-docs.json) |

ตรวจด้วย HTTP GET เมื่อวันที่ 19 ตุลาคม 2569 แล้ว Frontend, Events API, Swagger, OpenAPI JSON และ `/api/events` ผ่าน Vercel proxy ตอบ **200** ทั้งหมด การตรวจล่าสุดเวลา 09:05 UTC พบ API มี **13 รายการ**: อบรม 6, สัมมนา 3, จิตอาสา 4 รวมเผยแพร่ 7 และฉบับร่าง 6 โดย Render และ Vercel proxy คืน JSON ตรงกัน การตรวจครั้งก่อนหน้าพบ 15 รายการ จึงบันทึกจำนวนตามเวลาตรวจและไม่ถือว่าจำนวนต้องคงที่ รอบนี้ไม่ได้ส่ง mutation ไป Production

**Production ยังไม่ได้ deploy การแก้ไขรอบนี้:** OpenAPI ออนไลน์ยังระบุ DELETE 204 และไม่มี search/category query parameters จึงไม่ถือว่าคุณสมบัติใหม่ทำงานบน Production แล้ว ยังไม่ได้ทดสอบ POST/PUT/DELETE บน Production การเปิด Backend `/` ไม่ใช่ health check เพราะไม่มี route ดังกล่าว

สถาปัตยกรรม Production ตามปลายทางที่ให้มาและ configuration ในโค้ด:

```mermaid
flowchart LR
    U[Browser] --> V[Vercel: Next.js Frontend]
    V -->|rewrite /api/events/*| R[Render: Express API บน Bun]
    R -->|Sequelize| D[(PostgreSQL)]
```

Browser เรียก `/api/events` บน origin ของ Frontend จากนั้น Next.js ส่งต่อไปยัง Render ตาม `BACKEND_API_URL` หรือ fallback `NEXT_PUBLIC_API_URL` ฐานข้อมูลรองรับ PostgreSQL แบบ local และ Neon แต่ **ยังไม่มีหลักฐานยืนยัน provider ที่ใช้ใน Production**

## 3. เทคโนโลยีที่ใช้

ตัวเลขด้านล่างเป็นค่าที่ประกาศใน `package.json` หรือ Dockerfile เครื่องหมาย `^` และเลข major เป็นช่วงเวอร์ชัน ไม่ใช่ข้อยืนยันเวอร์ชันที่ติดตั้งบน Production

| ส่วน | เทคโนโลยี / เวอร์ชันที่ตรวจพบ |
| --- | --- |
| Frontend | Next.js `16.4.2`, React / React DOM `19.3.0`, TypeScript `^5`, App Router |
| Backend | Express `5`, TypeScript `5`, Bun; Docker ใช้ `1.3.13` |
| Database | PostgreSQL; Compose ใช้ `postgres:15-alpine`; รองรับ Neon ผ่าน `@neondatabase/serverless ^1.2.0` |
| ORM / Driver | Sequelize `6`, `pg ^8.23.1`, `pg-hstore ^2.3.4` |
| UI | Tailwind CSS `^4`, Radix UI `^1.8.1`, Lucide React `^1.59.0`, Sonner `^2.0.8` |
| UI utilities | `class-variance-authority`, `clsx`, `tailwind-merge` |
| Development | ESLint `^9`, Bun lockfiles, TypeScript, Docker Compose |
| Deployment | Vercel สำหรับ Frontend และ Render สำหรับ Backend ตามข้อมูลผู้ใช้; Dockerfile รองรับ self-hosting |

## 4. โครงสร้างโครงงาน

```text
.
├── README.md
├── docker-compose.yml
├── render.yaml                       # template สำหรับ Render ยังไม่ได้ apply
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── README.md
│   ├── package.json
│   ├── bun.lock
│   ├── tsconfig.json
│   ├── index.ts
│   ├── tests/                        # configuration, HTTP/DB integration และ test server fixture
│   ├── scripts/
│   │   ├── check-db.ts
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── config/
│       │   ├── database.ts
│       │   ├── database-setting.ts
│       │   ├── database-errors.ts
│       │   ├── neon-driver.ts
│       │   └── swagger.ts
│       ├── controllers/eventController.ts
│       ├── models/
│       │   ├── eventModel.ts
│       │   └── seedRunModel.ts
│       ├── routes/eventRoutes.ts
│       └── seeds/
│           ├── events.ts
│           └── seedEvents.ts
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── .dockerignore
    ├── AGENTS.md
    ├── Dockerfile
    ├── README.md
    ├── package.json
    ├── bun.lock
    ├── vercel.json
    ├── tests/events.test.ts
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── tsconfig.json
    ├── public/                     # logo และ SVG assets
    └── src/
        ├── app/                    # page.tsx, layout.tsx, globals.css, favicon.ico
        ├── components/
        │   ├── events/             # dashboard, list, form และ dialogs
        │   └── ui/                 # button, table, dialog และ input เป็นต้น
        ├── lib/                    # API client, validation และ utilities
        └── types/event.ts
```

`server.ts` เชื่อมฐานข้อมูล สร้างตารางที่ยังไม่มี seed และเริ่ม server ส่วน `app.ts` ตั้งค่า CORS, JSON parser, Swagger, routes และ error handler `controllers/` จัดการ CRUD และตรวจ request ขณะที่ `models/` กำหนด schema และ `seeds/` จัดการข้อมูลเริ่มต้น

Frontend ใช้ `event-dashboard.tsx` ควบคุมสถานะหน้าจอและเรียก API, `event-list.tsx` แสดงรายการ, `event-form.tsx` รับข้อมูล และ `event-dialogs.tsx` แสดงรายละเอียด/ฟอร์ม/ยืนยันลบ การ rewrite อยู่ใน `next.config.ts` เพิ่ม `frontend/vercel.json`, `render.yaml`, `backend/tests/` และ `frontend/tests/` แล้ว ไม่พบ migration directory

## 5. โครงสร้างฐานข้อมูล

อ้างอิง [Event model](backend/src/models/eventModel.ts) ใช้ตาราง `events`:

| Field | Sequelize type | ข้อกำหนด / ค่าเริ่มต้น |
| --- | --- | --- |
| `id` | `INTEGER` | Primary key, auto-increment |
| `title` | `STRING(150)` | ห้าม null/ว่าง, ความยาว 1–150 |
| `organizer` | `STRING(100)` | ห้าม null/ว่าง, ความยาว 1–100 |
| `category` | `STRING(50)` | ห้าม null, รับเฉพาะ `อบรม`, `สัมมนา`, `จิตอาสา` |
| `eventDate` | `DATEONLY` | ห้าม null, ต้องเป็นวันที่จริงรูปแบบ `YYYY-MM-DD` |
| `description` | `TEXT` | ห้าม null/ว่าง, model จำกัดความยาว 1–2,000 |
| `status` | `BOOLEAN` | ห้าม null, default `true` หมายถึงเผยแพร่; `false` คือฉบับร่าง |
| `createdAt` | `DATE` | Sequelize สร้าง timestamp เมื่อเพิ่มข้อมูล |
| `updatedAt` | `DATE` | Sequelize ดูแล timestamp เมื่อแก้ไขข้อมูล |

ฟิลด์หลักตรงกับ schema ที่ระบุในโจทย์ และเปิด `timestamps: true` หมวดหมู่เป็น STRING พร้อม Sequelize validation ไม่ใช่ database ENUM ข้อจำกัดความยาว description เป็น validation ของ model ไม่ใช่ชนิด `VARCHAR(2000)` ในฐานข้อมูล

Controller ตรวจซ้ำก่อนบันทึก โดยข้อความต้องเป็น string ที่มีอักขระนอกเหนือจากช่องว่าง วันที่ต้องมีอยู่จริง และ `status` ถ้าส่งมาต้องเป็น boolean Frontend trim ข้อความก่อนส่ง ทั้ง Frontend, Controller และ Model ไม่รับปี `0000`

มีตาราง `seed_runs` เพิ่มเติม ใช้ `key STRING(100)` เป็น primary key ไม่มี timestamps เพื่อบันทึก marker `initial-events-v1` ป้องกัน seed ซ้ำ การเริ่มระบบใช้ `sequelize.sync()` โดยไม่ใช้ `force` หรือ `alter` จึงสร้างตารางที่ขาด แต่ไม่ใช่ migration สำหรับเปลี่ยน schema เดิม

## 6. ซอฟต์แวร์ที่ต้องมี

- Git สำหรับ clone repository
- Bun `1.3.13` ตาม `frontend/package.json` และ Dockerfiles สำหรับติดตั้ง dependencies และรัน Backend TypeScript
- Node.js 22 ตาม Frontend Dockerfile เป็นเวอร์ชันอ้างอิงสำหรับ Frontend; ไม่พบ `engines` ระบุ minimum version ใน package files
- PostgreSQL 15 ตาม Compose หรือบัญชี Neon พร้อม PostgreSQL connection string
- Docker พร้อม Docker Compose หากเลือกวิธี Docker

โครงการใช้ `bun.lock` ทั้งสองส่วน ไม่มี `package-lock.json` จึงใช้ Bun เป็นขั้นตอนหลัก ไม่จำเป็นต้องใช้ npm ในคู่มือนี้ การ build Frontend มี `next/font/google` และอาจต้องเข้าถึง Google Fonts; Swagger UI ต้องเข้าถึง `unpkg.com`

## 7. การติดตั้งและรันในเครื่อง

### 7.1 Clone repository

```sh
git clone https://github.com/tudzydev/674259009_7153403_Final_4.git
cd 674259009_7153403_Final_4
```

### 7.2 ติดตั้ง dependencies และเตรียม environment

Backend:

```sh
cd backend
bun install --frozen-lockfile
cp .env.example .env.local
cd ..
```

Frontend:

```sh
cd frontend
bun install --frozen-lockfile
cp .env.example .env.local
cd ..
```

แก้ค่าฐานข้อมูลใน `backend/.env.local` ให้ตรงกับฐานข้อมูลที่ใช้ โดยไฟล์ตัวอย่างใช้ placeholder ไม่ใช่รหัสผ่านใช้งานจริง Backend example กำหนด `PORT=4000` เพื่อไม่ชน Frontend แม้โค้ด Backend จะมี default port เป็น 3000

### 7.3 สร้างหรือเชื่อมต่อ PostgreSQL

หากใช้ PostgreSQL จาก Compose ให้รันที่ root:

```sh
docker compose up -d postgres
```

Compose สร้างฐานข้อมูล `event_db` และเปิดที่ `localhost:5433` บัญชี local development กำหนดไว้ใน `docker-compose.yml` ให้นำมาใส่ใน `.env.local` โดยไม่ใช้บัญชีตัวอย่างนี้กับ Production หากมี PostgreSQL อยู่แล้ว ให้สร้าง database และ user ของตนเองก่อน แล้วแก้ `DATABASE_URL` ให้ตรงกัน

ตรวจ connection แบบไม่สร้างตารางหรือแก้ข้อมูล:

```sh
cd backend
bun run db:check:local
```

### 7.4 สร้างตารางและ seed

เมื่อรัน Backend ระบบจะเรียก `sequelize.sync()` และ seed อัตโนมัติ ไม่ต้องใช้ migration command หากต้องการสร้างตารางและ seed โดยยังไม่เปิด server ให้รันใน `backend/`:

```sh
bun run db:seed:local
```

มีข้อมูลเริ่มต้น **12 รายการ** หมวดหมู่ละ 4 รายการ โดยแต่ละหมวดมีเผยแพร่ 2 และฉบับร่าง 2 รวมเผยแพร่ 6 และฉบับร่าง 6 ใช้ transaction และ PostgreSQL advisory lock เพื่อให้ seed พร้อมกันได้โดยไม่เพิ่มซ้ำ เมื่อมี marker แล้ว การรันซ้ำจะไม่คืนข้อมูลที่ลบหรือเขียนทับข้อมูลที่แก้ไข และรายการเดิมก่อน seed ยังคงอยู่

### 7.5 เปิด Backend และ Frontend

Terminal แรก จาก root:

```sh
cd backend
bun run dev:local
```

Terminal ที่สอง จาก root:

```sh
cd frontend
bun run dev
```

เปิด [Frontend](http://localhost:3000), [Events API](http://localhost:4000/api/events) และ [Swagger UI](http://localhost:4000/api/events/docs) อย่าใช้ Backend default port 3000 พร้อม Frontend ที่ port เดียวกัน

หากใช้ Neon ให้คัดลอก `backend/.env.example` เป็น `backend/.env.neon`, เปลี่ยน `DATABASE_PROVIDER=neon` และใส่ connection string ส่วนตัว จากนั้นใช้ `bun run db:check:neon`, `bun run db:seed:neon` หรือ `bun run dev:neon` ใน `backend/` ตามต้องการ

### 7.6 ทางเลือก: Docker ทั้งระบบ

จาก root โดย Compose กำหนด environment ของ container ไว้แล้ว:

```sh
docker compose up -d --build
docker compose ps
```

Frontend อยู่ port 3000, Backend port 4000, PostgreSQL port 5433 บริการรอ dependency ผ่าน healthcheck และข้อมูลฐานข้อมูลเก็บใน named volume `pgdata`

หาก port 3000/4000 ถูกใช้งาน:

```sh
FRONTEND_PORT=3100 BACKEND_PORT=4001 docker compose up -d --build
```

จะเปิด Frontend ที่ `http://localhost:3100` และ API ที่ `http://localhost:4001/api/events` โดย container ยังสื่อสารผ่าน `backend:4000` และ `postgres:5432` ตามเดิม ใช้ค่า port เดิมในการรัน Compose ครั้งต่อไป Frontend รับ API destination ตอน build จึงต้อง rebuild เมื่อเปลี่ยนปลายทาง

```sh
docker compose logs --tail=100 backend frontend
docker compose down
```

`docker compose down` เก็บ volume เดิมไว้ การลบ volume จะทำให้ข้อมูล local สูญหาย

## 8. ตัวแปรสภาพแวดล้อม

ไฟล์ตัวอย่าง: [Frontend](frontend/.env.example), [Backend](backend/.env.example) ห้าม commit `.env.local`, `.env.neon` หรือ credentials จริง `.gitignore` ของทั้งสองส่วนละเว้นไฟล์ environment และอนุญาต `.env.example`

### Frontend

| ชื่อ | หน้าที่ | ตัวอย่าง |
| --- | --- | --- |
| `BACKEND_API_URL` | Backend origin สำหรับ Next.js rewrite; มีลำดับความสำคัญสูงสุด | `http://localhost:4000` หรือ `https://event-backend-5m5f.onrender.com` |
| `NEXT_PUBLIC_API_URL` | Fallback เมื่อไม่ได้กำหนด `BACKEND_API_URL` | `https://event-backend-5m5f.onrender.com` |
| `PORT` | Port ของ Next.js server; Docker กำหนด 3000 | `3000` |
| `HOSTNAME` | Bind address ของ standalone server ใน Docker | `0.0.0.0` |
| `NODE_ENV` | โหมดรันใน Docker / Production | `production` |
| `NEXT_TELEMETRY_DISABLED` | ปิด Next.js telemetry ใน Dockerfile | `1` |

สองตัวแรกอ่านใน `next.config.ts` ส่วน `PORT`, `HOSTNAME`, `NODE_ENV`, `NEXT_TELEMETRY_DISABLED` ใช้โดย runtime/Docker ไม่ใช่ตัวแปร business logic `NEXT_PUBLIC_API_URL` ในโครงการนี้ไม่ได้ใช้เป็น URL ตรงใน browser API client และไม่ควรบรรจุ secret

ปลายทางต้องเป็น **origin ที่ไม่มี `/api/events` ต่อท้าย** เพราะ rewrite เติม path ให้อีกครั้ง หากไม่กำหนดสองตัวแรกจะใช้ `http://localhost:4000` ต้องตั้งค่าก่อน build และ rebuild/redeploy เมื่อเปลี่ยนค่า

### Backend

| ชื่อ | หน้าที่ | ตัวอย่างที่ปลอดภัย |
| --- | --- | --- |
| `PORT` | Port ของ Express; default ในโค้ด 3000; local example / Docker ใช้ 4000 | `4000` |
| `DATABASE_PROVIDER` | `local` หรือ `neon`; default `local` | `local` |
| `DATABASE_URL` | PostgreSQL connection string จำเป็นต้องกำหนด | `postgres://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5433/event_db` |
| `DATABASE_CONNECT_TIMEOUT_MS` | Timeout จำนวนเต็ม 1–60000; default 10000 | `10000` |
| `FRONEND_URL` | CORS allowed origins คั่นด้วย comma; สะกดตามโค้ดจริง | `http://localhost:3000,https://674259009-7153403-final-d.vercel.app` |
| `NODE_EXTRA_CA_CERTS` | ทางเลือก: trusted CA file ของ runtime ก่อนเริ่ม Bun หากเครือข่ายใช้ TLS inspection | `/absolute/path/to/trusted-ca.pem` |
| `NODE_ENV` | โหมด Production ที่ Dockerfile / Compose กำหนด | `production` |

`FRONEND_URL` **ไม่มีตัว T หลัง N** อย่าเปลี่ยนชื่อเป็น `FRONTEND_URL` โดยไม่แก้โค้ด Backend รับ origin หลายค่า ตัดช่องว่างและ slash ท้ายออก หากไม่กำหนดจะอนุญาต localhost/127.0.0.1 ที่ port 3000, 3001, 3100 และ Vercel URL ข้างต้น อนุญาต GET, HEAD, POST, PUT, DELETE, OPTIONS และ header `Content-Type` ส่วน origin อื่นจะไม่ได้ `Access-Control-Allow-Origin`

โหมด `neon` ใช้ secure WebSocket (`wss`, port 443) ผ่าน Neon driver และตรวจ certificate โดย transport จึงตั้ง PostgreSQL TLS ภายใน tunnel เป็น false ไม่ใช่การปิดการตรวจ certificate ของ WebSocket โหมด `local` ใช้ plain TCP ค่า `sslmode`, `sslcert`, `sslkey`, `sslrootcert` ใน URL ถูกตัดออก `DATABASE_SSL_CA_FILE` เป็นค่าเก่าที่โค้ดปฏิเสธเมื่อใช้ Neon จึงไม่ใส่ใน example ใหม่

`FRONTEND_PORT` และ `BACKEND_PORT` เป็นตัวแปรสำหรับเปลี่ยน port mapping ของ Compose เท่านั้น ไม่ใช่ตัวแปร API client

## 9. RESTful API

อ้างอิง [routes](backend/src/routes/eventRoutes.ts), [controller](backend/src/controllers/eventController.ts) และ [error handler](backend/src/app.ts) Base URL ในเครื่องคือ `http://localhost:4000` และ Production คือ `https://event-backend-5m5f.onrender.com`

| Method | Endpoint | การทำงาน | Success Status |
| --- | --- | --- | --- |
| GET | `/api/events` | รายการทั้งหมด เรียง `eventDate ASC`, `id ASC` | 200 |
| GET | `/api/events/:id` | รายละเอียดหนึ่งรายการ | 200 |
| POST | `/api/events` | เพิ่มกิจกรรม | 201 |
| PUT | `/api/events/:id` | แก้ไขกิจกรรม ส่ง required fields ให้ครบ | 200 |
| DELETE | `/api/events/:id` | ลบกิจกรรม ตอบ JSON message | **200** |
| GET | `/api/events/docs` | Swagger UI | 200 ตามโค้ด |
| GET | `/api-docs.json` | OpenAPI 3.0.3 specification | 200 ตามโค้ด |

สถานะ CRUD ในตารางยืนยันด้วย integration tests บน PostgreSQL local แล้ว ไม่ใช่ผลทดสอบ mutation บน Production ไม่มี PATCH endpoint และ `PUT` ไม่ใช่ partial update

### Request: POST / PUT

ส่ง `Content-Type: application/json` ตัวอย่างต่อไปนี้เป็นข้อมูลประกอบเอกสาร ไม่ใช่ payload ที่นำไปทดสอบ Production:

```json
{
  "title": "กิจกรรมอบรม",
  "organizer": "ผู้จัดกิจกรรม",
  "category": "อบรม",
  "eventDate": "2026-12-01",
  "description": "รายละเอียดกิจกรรม",
  "status": true
}
```

ต้องส่ง `title`, `organizer`, `category`, `eventDate`, `description` ทั้ง POST และ PUT ส่วน `status` ไม่บังคับ: POST ใช้ default true และ PUT เก็บค่าเดิมหากไม่ส่ง ฟิลด์อื่นที่เกินจากที่รองรับไม่ถูกนำไปบันทึก `id` ต้องเป็นเลขจำนวนเต็มบวก 1–2147483647 ในรูปแบบตัวเลขที่ไม่ขึ้นต้นด้วย 0

### Response examples

ตัวอย่าง GET detail, POST และ PUT ใช้ envelope เดียวกัน แต่ POST มี status 201 ส่วน GET/PUT เป็น 200 ค่า id และ timestamps ต่อไปนี้เป็นเพียงตัวอย่าง:

```json
{
  "data": {
    "id": 1,
    "title": "กิจกรรมอบรม",
    "organizer": "ผู้จัดกิจกรรม",
    "category": "อบรม",
    "eventDate": "2026-12-01",
    "description": "รายละเอียดกิจกรรม",
    "status": true,
    "createdAt": "2026-10-19T00:00:00.000Z",
    "updatedAt": "2026-10-19T00:00:00.000Z"
  }
}
```

GET list ตอบ `{"data": [ ... ]}` โดยแต่ละสมาชิกมีโครงสร้างเหมือน object ใน `data` ด้านบน หากไม่มีรายการตอบ `{"data": []}` ส่วน DELETE สำเร็จตอบ **200** พร้อม `{"message":"Event deleted successfully"}` โดย Frontend ยังรองรับ 204 จาก API เวอร์ชันเก่า

### Query parameters และการกรอง

| Parameter | Frontend ส่งอย่างไร | พฤติกรรม Backend ปัจจุบัน |
| --- | --- | --- |
| `search` | คำค้นที่ trim แล้ว | ค้น substring ของ title หรือ organizer แบบไม่สนตัวพิมพ์เล็กใหญ่ด้วย PostgreSQL ILIKE |
| `category` | หมวดหมู่ที่เลือก | กรองตรงค่าเฉพาะ `อบรม`, `สัมมนา`, `จิตอาสา`; ใช้ร่วมกับ search ได้ |

ตัวอย่าง `GET /api/events?search=Excel&category=อบรม` ค้นหาและกรองที่ server โดย `%`, `_` และ backslash ในคำค้นเป็นอักขระปกติ ไม่ใช่ SQL wildcard ค่าว่างไม่จำกัดผลลัพธ์; query ที่ส่งหลายค่าใน key เดียว หรือหมวดหมู่ที่ไม่รองรับ ตอบ 400 `Invalid event filters`

`eventApi.getAll()` ยังกรองผลซ้ำใน Frontend เพื่อรองรับ Production รุ่นเก่าที่ยังไม่กรองฝั่ง server การกรองสถานะและเรียงลำดับเพิ่มเติมทำใน dashboard ไม่มี server-side pagination

### Error responses

| HTTP | ตัวอย่าง body | เงื่อนไขตามโค้ด |
| --- | --- | --- |
| 400 | `{"error":"Invalid event ID"}` | ID ไม่ถูกต้อง |
| 400 | `{"error":"Invalid event filters"}` | search/category มีชนิดหรือค่าที่ไม่รองรับ |
| 400 | `{"error":"Invalid event input"}` | required fields, type, ความยาว, หมวดหมู่, วันที่ หรือ Sequelize validation ไม่ผ่าน |
| 400 | `{"error":"Invalid JSON request"}` | JSON request ไม่ถูกต้อง |
| 404 | `{"error":"Event not found"}` | ไม่พบกิจกรรม |
| 404 | `{"error":"Route not found"}` | ไม่มี route ที่เรียก |
| 500 | `{"error":"Internal server error"}` | ข้อผิดพลาดที่ไม่เข้าเงื่อนไขข้างต้น เช่น database query ล้มเหลวหลังเปิด server |

Backend ไม่ส่งรายละเอียด database error ให้ client หากเชื่อมฐานข้อมูลไม่ได้ตั้งแต่ startup ระบบจะไม่เปิด listener จึงไม่ใช่กรณีตอบ HTTP 500 จาก server ที่พร้อมใช้งาน Frontend อ่าน error key `error` และ fallback `message` พร้อมเก็บ HTTP status แล้ว จึงแสดงข้อความจาก Backend ผ่าน error state/toast ได้

## 10. ความสามารถของหน้าจอ

สถานะต่อไปนี้หมายถึงพบ implementation ยังต้องทดสอบการใช้งานจริงตามหัวข้อ 13

| ความสามารถ | รายละเอียด |
| --- | --- |
| รายการกิจกรรม | ตารางบน desktop และ cards บน mobile พร้อมวันที่ หมวดหมู่ สถานะ |
| ภาพรวม | จำนวนทั้งหมด/เผยแพร่/ฉบับร่าง และกิจกรรมเผยแพร่ที่กำลังจะมาถึงไม่เกิน 3 รายการ |
| รายละเอียด | Dialog แสดงข้อมูลและ timestamps จากรายการที่โหลดมา; มี API client `getById()` แต่ dialog ไม่เรียกแยก |
| เพิ่ม / แก้ไข | Dialog ใช้ฟอร์มร่วมกัน ส่ง POST / PUT แล้ว refresh รายการและสถิติ |
| ลบ | Alert dialog ระบุชื่อกิจกรรม มีปุ่มยกเลิกและยืนยัน ส่ง DELETE เมื่อยืนยัน |
| Search / Filter | ชื่อกิจกรรมหรือผู้จัด, หมวดหมู่ 3 ประเภท และสถานะ; ค้นหามี debounce 300 ms |
| Sorting | วันที่ใกล้/ไกล และชื่อกิจกรรม |
| Form validation | ตรวจ required, ความยาว, category, วันที่, boolean; แสดง error ใต้ field และ focus จุดแรกที่ผิด |
| Loading / Pending | Spinner, skeleton, ปิดปุ่มระหว่างบันทึก/ลบ และป้องกัน mutation ซ้ำ |
| Empty / Error | แยกไม่มีข้อมูลกับไม่พบตามคำค้น, มีปุ่มล้างตัวกรองและลองใหม่เมื่อโหลดล้มเหลว |
| Toast | Sonner แจ้งผลเพิ่ม/แก้ไข/ลบสำเร็จหรือไม่สำเร็จ |

สิ่งที่ยังต้องตรวจคือการกดใช้งาน UI ผ่าน browser จริง ส่วนการใช้ Next.js ได้รับอนุญาตจากอาจารย์แล้วตามข้อมูลที่ผู้จัดทำยืนยัน Automated tests ยืนยัน API/ฐานข้อมูลและ Frontend validation/API client แล้วตามหัวข้อ 13

## 11. ภาพหน้าจอ

**TODO: ยังไม่พบภาพหน้าจอทั้ง 4 ไฟล์ และยังไม่ได้บันทึกภาพจริงในรอบนี้** โครงสร้างที่ต้องเพิ่มก่อนส่ง:

```text
docs/
└── screenshots/
    ├── event-list.png
    ├── event-create.png
    ├── event-edit.png
    └── event-delete-confirm.png
```

| ภาพที่ต้องบันทึก | สิ่งที่ควรแสดง | สถานะ |
| --- | --- | --- |
| หน้ารายการกิจกรรม | เมนูจัดการกิจกรรม รายการจริงและตัวกรอง | TODO: `docs/screenshots/event-list.png` |
| หน้าเพิ่มกิจกรรม | Dialog เพิ่มพร้อม required fields และสถานะ | TODO: `docs/screenshots/event-create.png` |
| หน้าแก้ไขกิจกรรม | Dialog แก้ไขที่แสดงข้อมูลรายการเดิม | TODO: `docs/screenshots/event-edit.png` |
| หน้ายืนยันการลบกิจกรรม | Dialog พร้อมชื่อกิจกรรมและปุ่มยืนยัน/ยกเลิก | TODO: `docs/screenshots/event-delete-confirm.png` |

Markdown image references ต่อไปนี้เป็น **placeholder รอไฟล์จริง** จึงเก็บใน code block เพื่อไม่แสดงภาพเสีย หลังบันทึกภาพตาม path แล้วให้นำ code fence ออก:

```markdown
![หน้ารายการกิจกรรม](docs/screenshots/event-list.png)
![หน้าเพิ่มกิจกรรม](docs/screenshots/event-create.png)
![หน้าแก้ไขกิจกรรม](docs/screenshots/event-edit.png)
![หน้ายืนยันการลบกิจกรรม](docs/screenshots/event-delete-confirm.png)
```

## 12. การนำขึ้นใช้งาน (Deployment)

### Frontend — Vercel

| รายการ | ค่าที่สอดคล้องกับ repository |
| --- | --- |
| Production URL | [เปิด Frontend](https://674259009-7153403-final-d.vercel.app/) — ผู้ใช้ยืนยัน |
| Root Directory | `frontend` |
| Framework | Next.js |
| Install Command | `bun install --frozen-lockfile` |
| Build Command | `bun run build` (`next build`) |
| Output Directory | ใช้ค่าเริ่มต้นของ Next.js preset; build อยู่ `.next` และมี standalone output ตาม `next.config.ts` ไม่ใช่ `dist` |
| Environment | `BACKEND_API_URL=https://event-backend-5m5f.onrender.com` หรือ `NEXT_PUBLIC_API_URL` เป็น fallback |

มี [frontend/vercel.json](frontend/vercel.json) กำหนด framework/install/build commands แล้ว ส่วน Root Directory `frontend` และ API environment ต้องตั้งใน dashboard และยังไม่ได้ apply ไฟล์ใหม่นี้บน Production เปลี่ยน API destination แล้วต้อง redeploy รายละเอียดรูปแบบไฟล์อ้างอิง [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json) Production ไม่ใช้ `bun run start` เป็น Vercel start command ส่วนการรัน production build เองใช้ `bun run build` แล้ว `bun run start` ภายใน `frontend/`

### Backend — Render

| รายการ | ค่าที่สอดคล้องกับ repository |
| --- | --- |
| Production URL | [Render Backend](https://event-backend-5m5f.onrender.com) — ผู้ใช้ยืนยัน |
| Root Directory | `backend` |
| Runtime | ต้องมี Bun; repository มี Dockerfile `oven/bun:1.3.13` |
| Build Command สำหรับ Bun runtime | `bun install --frozen-lockfile --production`; ไม่พบ npm/bun build script ของ Backend |
| Start Command สำหรับ Bun runtime | `bun run start` ซึ่งเรียก `bun src/server.ts` |
| Docker deployment | ใช้ `backend/Dockerfile`; Docker build ติดตั้ง dependencies และ CMD เรียก start ให้อยู่แล้ว |
| PORT | ใช้ค่า `PORT` ของ hosting environment; Dockerfile มี default 4000; โค้ด fallback 3000 |
| Database environment | `DATABASE_PROVIDER`, `DATABASE_URL`, ทางเลือก `DATABASE_CONNECT_TIMEOUT_MS` |
| CORS environment | `FRONEND_URL=https://674259009-7153403-final-d.vercel.app` |
| API Base URL | [Events API](https://event-backend-5m5f.onrender.com/api/events) |

มี [render.yaml](render.yaml) เป็น Docker deployment template แล้ว แต่ยังไม่ได้ apply และยังไม่ยืนยัน runtime/คำสั่งใน Render Dashboard ชื่อ service `event-backend` ใน template ต้องเทียบกับ service เดิมก่อนนำไปเชื่อม Blueprint ตั้ง `DATABASE_PROVIDER` และ `DATABASE_URL` ผ่าน dashboard โดย `sync: false` ไม่เก็บ secret ใน repository ค่า Dockerfile/context อ้างอิงจาก `rootDir: backend` ตาม [Render monorepo documentation](https://render.com/docs/monorepo-support) หากใช้ Docker runtime ไม่ต้องนำ Build/Start Command ของ native runtime ไปตั้งทับ Dockerfile ทุกครั้งที่เริ่ม server จะ authenticate, sync และตรวจ marker ก่อน seed ไม่พบ health endpoint แยก; Compose ใช้ GET `/api/events` ตรวจ readiness

### Database และหลักฐาน persistence

| ประเด็น | หลักฐานที่พบ | ข้อจำกัด |
| --- | --- | --- |
| เก็บข้อมูลจริง | Controller เรียก `Event.findAll/findByPk/create/update/destroy` ผ่าน Sequelize PostgreSQL | CRUD ผ่านบน PostgreSQL local; ยังไม่ทดสอบ mutation บน Production |
| Local persistence | `pgdata:/var/lib/postgresql/data` ใน Compose | ตรวจ configuration แล้ว; ทดสอบ restart ของ Backend process แล้ว แต่ยังไม่ restart PostgreSQL container |
| Seed persistence | `seed_runs` marker และ events commit ใน transaction เดียวกัน พร้อม advisory lock | integration tests ยืนยัน 12 seed records และไม่เพิ่มซ้ำ; Production ตรวจล่าสุดมี 13 รายการ |
| Neon support | `DATABASE_PROVIDER=neon` เลือก secure WebSocket driver | ไม่ยืนยันว่า Production ใช้ Neon |
| Production provider | **TODO:** ยืนยันชื่อ provider และการตั้งค่า backup/retention จาก dashboard โดยไม่เปิดเผย connection string | GET ผ่าน Render และ Vercel proxy ยืนยันการอ่าน แต่ยังไม่พิสูจน์ provider หรือ persistence หลัง redeploy |

ฐานข้อมูล Production ต้องอยู่ใน PostgreSQL service ที่เก็บข้อมูลถาวรแยกจาก filesystem ของ Backend ใช้ `DATABASE_URL` ใน secrets/environment ของ Render และไม่บันทึก credentials ลง README การยืนยัน persistence ต้องบันทึกข้อมูลทดสอบแล้วตรวจซ้ำหลัง refresh และ restart/redeploy ตามหัวข้อถัดไป

## 13. การตรวจสอบและทดสอบ

ผลตรวจเมื่อวันที่ 19 ตุลาคม 2569 หลังแก้ Backend filtering, DELETE response และ Frontend error handling โดยไม่แคปภาพหน้าจอตามคำขอ

### ผลทดสอบที่ยืนยันแล้ว

| รายการ | ผลจริง | ขอบเขต |
| --- | --- | --- |
| Backend typecheck | ผ่าน `bun run typecheck` | รวม source, scripts และ tests |
| Backend automated tests | **21 ผ่าน / 0 ไม่ผ่าน** เมื่อเปิด DB tests | configuration 7 และ integration 14 บน PostgreSQL 15 local |
| Frontend automated tests | **11 ผ่าน / 0 ไม่ผ่าน** | validation, search/sort utilities, API client/error contract |
| Frontend lint | ผ่าน `bun run lint` | ESLint |
| Frontend production build | **ผ่าน `bun run build`** | TypeScript และ static pages ผ่าน; แยก Turbopack cache ที่เก็บข้อผิดพลาดจาก sandbox แล้ว build ใหม่สำเร็จ |
| Production read checks | HTTP **200** | Frontend, Render GET events, Vercel GET events proxy, Swagger และ OpenAPI JSON |
| Production CORS preflight | HTTP **204**, allowed origin ตรง Vercel URL | OPTIONS สำหรับ POST พร้อม Content-Type; ไม่ได้ส่ง POST จริง |

Backend integration tests ใช้ schema ชั่วคราวชื่อ `exam_test_<random>` สร้างและลบเฉพาะ schema ของตนเอง รับเฉพาะ PostgreSQL host แบบ localhost/loopback และ **ไม่ใช้ DATABASE_URL จาก .env โดยปริยาย** จึงไม่เขียนข้อมูล Production

การทดสอบยืนยัน HTTP CRUD ทั้ง 5 routes, validation/JSON/ID ที่ไม่ถูกต้อง (400), ไม่พบข้อมูล (404), query failure ที่จำลองด้วยการเปลี่ยนชื่อตารางชั่วคราวใน test schema (500), search ชื่อ/ผู้จัดแบบไม่สนตัวพิมพ์ใหญ่เล็ก, category ร่วมกับ search, literal wildcard, CORS และ Swagger

Seed tests ยืนยันการเรียกพร้อมกันไม่เพิ่มซ้ำ ได้ 12 รายการครบ 3 หมวดและทั้งสองสถานะ พร้อมเก็บ edits/deletions เมื่อ seed ซ้ำ Persistence tests อ่านผ่าน connection ใหม่และ **เริ่ม Backend process ใหม่จริงสองครั้ง** โดยข้อมูลที่แก้ไขและจำนวนรายการยังคงเดิม ไม่ได้หมายถึงทดสอบ restart PostgreSQL container หรือ Production redeploy แล้ว

Frontend tests ตรวจรูปแบบข้อมูล, form errors, search/sort, query parameters, network errors, API 400/404/500 และ DELETE ทั้ง 200/legacy 204 โดยจำลอง fetch จึงไม่ใช่การทดสอบกด UI บน browser จริง

### คำสั่งทดสอบที่รันซ้ำได้

เริ่ม PostgreSQL จาก root:

```sh
docker compose up -d postgres
```

Backend:

```sh
cd backend
bun run typecheck
bun test
bun run test:integration
```

`bun test` ปกติจะรัน configuration tests และข้าม DB tests ส่วน `bun run test:integration` รัน integration 14 ข้อ ตั้งค่าเริ่มต้นเป็นบัญชี local development ของ Compose ที่ `127.0.0.1:5433/event_db` หากใช้ PostgreSQL local ของตนเอง ให้ export `TEST_DATABASE_URL` ด้วยบัญชีทดสอบก่อนรัน ห้ามใส่ connection string จริงใน Git หากต้องการรัน configuration และ integration พร้อมกัน:

```sh
RUN_DB_TESTS=1 bun test
```

Frontend:

```sh
cd frontend
bun test
bun run lint
bun run build
```

### สิ่งที่ยังต้องทดสอบหรือดำเนินการ

| รายการ | สิ่งที่ยังขาด |
| --- | --- |
| Browser end-to-end | กดเพิ่ม/แก้ไข/ยืนยันลบ/ยกเลิก, ตัวกรองร่วมกัน และตรวจ spinner/retry/toast จริง; รอบนี้ไม่มีเครื่องมือ browser control ให้ใช้งาน |
| Production deployment build | Local production build ผ่านแล้ว; ยังต้องตรวจ build log บน hosting หลัง deploy เวอร์ชันใหม่ |
| Deployment เวอร์ชันใหม่ | ยังไม่ได้ deploy working tree นี้; Production OpenAPI ยังมี DELETE 204 และไม่มี query parameters |
| Production CRUD | ยังไม่ส่ง POST/PUT/DELETE บน Production; ต้องใช้ข้อมูลทดสอบที่แยกชัดเจน |
| Production persistence | ยังไม่ทดสอบหลัง restart/redeploy หรือยืนยัน provider/backup จาก dashboard |
| Database container persistence | มี named volume แต่ยังไม่ restart PostgreSQL container เพื่อตรวจซ้ำ |

## 14. Checklist เทียบข้อกำหนดข้อสอบ

`[x] ครบ` หมายถึงมีหลักฐานตามขอบเขตที่ระบุ `[ ] ยังไม่ครบ` หมายถึงยังขาด implementation/ไฟล์ และ `[ ] ยังไม่ยืนยัน` หมายถึงต้องตรวจเพิ่มเติม ไม่ใช้ผล local ไปแทนผล Production

- [x] **ครบ:** แยก `frontend/` และ `backend/` พร้อม package scripts และ source structure
- [x] **ครบตามข้อยกเว้นที่อาจารย์อนุญาต:** Frontend ใช้ Next.js + React แทน React + Vite โดยผู้จัดทำยืนยันว่าได้สอบถามอาจารย์แล้ว
- [x] **ครบ:** Sequelize Event model มีฟิลด์/ชนิดตาม schema พร้อม validation/timestamps
- [x] **ครบและทดสอบ local แล้ว:** RESTful endpoints ทั้ง 5 รายการ
- [x] **ครบใน working tree:** DELETE ตอบ 200 พร้อม JSON message ตามโจทย์; Production ยังเป็น 204
- [x] **ครบในโค้ด:** UI CRUD พร้อมรายละเอียดและยืนยันลบ
- [ ] **ยังไม่ยืนยัน:** การกด UI CRUD แบบ end-to-end ใน browser
- [x] **ครบและทดสอบแล้ว:** Backend search/category filtering รวมถึง query validation
- [x] **ครบและทดสอบระดับ unit:** Frontend search/filter utilities, form validation และ API client
- [x] **ครบและทดสอบ local แล้ว:** Controller/model validation และ HTTP 400/404/500
- [x] **ครบในโค้ด:** Loading, pending, empty/error states, retry และ toast; ยังต้องตรวจหน้าจอจริง
- [x] **ครบและทดสอบแล้ว:** seed อย่างน้อย 10 รายการ — มี 12 รายการ
- [x] **ครบและทดสอบแล้ว:** 3 หมวด หมวดละ 4; เผยแพร่ 6 และฉบับร่าง 6
- [x] **ครบ:** Frontend/Backend `.env.example` พร้อม ignore secrets
- [ ] **เว้นตามคำขอ:** ภาพหน้าจอ 4 ไฟล์ — ยังไม่บันทึก
- [x] **ครบ:** มี Production URL ของ Vercel/Render และ HTTP GET ตอบ 200
- [x] **ครบสำหรับการอ่าน:** GET ผ่าน Vercel proxy และ Render API ได้จริง; local CORS test และ Production OPTIONS preflight ผ่าน
- [x] **ครบเป็น configuration template:** `frontend/vercel.json` และ `render.yaml` ไม่มี secret
- [ ] **ยังไม่ยืนยัน:** ค่า dashboard และ database provider ของ Production; CORS preflight ตรวจผ่านแล้ว
- [ ] **ยังไม่ครบ:** deploy การแก้ไขรอบนี้ขึ้น Vercel/Render และตรวจเวอร์ชันใหม่
- [x] **ครบและทดสอบ local แล้ว:** ข้อมูล PostgreSQL และ seed marker คงอยู่หลังเริ่ม Backend process ใหม่จริงสองครั้ง
- [ ] **ยังไม่ยืนยัน:** Persistence หลัง Production redeploy และ restart PostgreSQL container
- [x] **ครบและทดสอบแล้ว:** Frontend production build รวม TypeScript/static generation ผ่าน
- [ ] **ยังไม่ยืนยัน:** ชื่อ repository ตรงรูปแบบที่อาจารย์กำหนด — ปัจจุบันลงท้าย `_Final_4` แต่ชุดโจทย์คือ D; ไม่พบเอกสารรูปแบบชื่อที่ชัดเจน
- [ ] **ยังไม่ครบ:** ชื่อผู้จัดทำและการยืนยันรหัสนักศึกษาจากเจ้าของโครงงาน

### สิ่งที่ต้องเติมหรือยืนยันก่อนส่ง

1. ชื่อผู้จัดทำ รหัสนักศึกษา และรูปแบบชื่อ repository ที่อาจารย์กำหนด
2. Deploy โค้ดล่าสุด โดยตรวจ build log/configuration บน Vercel/Render และ provider ของฐานข้อมูล
3. Browser end-to-end และ Production mutation/persistence tests ที่ยังไม่ได้ทำ
4. ภาพหน้าจอทั้ง 4 รายการเว้นไว้ตามคำขอ ไม่สร้างภาพสมมติ

การแก้ไขรอบนี้เพิ่มการค้นหา/กรองที่ Backend, DELETE 200, error handling ที่ตรงกัน, validation ปี `0000`, automated tests และ deployment templates โดยไม่มีการติดตั้ง package เพิ่ม ไม่มีการแคปภาพ และไม่ได้แก้ข้อมูล Production
