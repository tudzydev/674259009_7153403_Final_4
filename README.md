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

> **ข้อแตกต่างจากข้อสอบ:** Frontend ใช้ **Next.js App Router + React** ไม่ใช่ React + Vite ส่วน `DELETE /api/events/:id` ตอบกลับ **204 No Content** ไม่ใช่ 200 และ Backend ยังไม่รองรับ search/category filtering ผ่าน query parameters

## 2. ภาพรวมโครงงาน

ระบบใช้บันทึกและบริหารกิจกรรมประเภท **อบรม สัมมนา และจิตอาสา** ผู้ใช้สามารถดูรายการและรายละเอียด เพิ่ม แก้ไข ลบกิจกรรม และกำหนดสถานะเผยแพร่หรือฉบับร่างได้ ข้อมูลถูกอ่านและเขียนผ่าน REST API ไปยัง PostgreSQL ด้วย Sequelize ไม่ใช่ข้อมูลจำลองที่เก็บเฉพาะในหน่วยความจำหรือ browser

หน้าจอมีภาพรวมจำนวนกิจกรรม กิจกรรมที่กำลังจะมาถึง การค้นหาจากชื่อกิจกรรมหรือผู้จัด การกรองหมวดหมู่และสถานะ และการเรียงตามวันที่หรือชื่อ การค้นหาและกรองทำที่ Frontend หลังรับรายการจาก API รายละเอียดและฟอร์มเปิดเป็น dialog บนหน้า `/` ไม่ได้มี URL แยกสำหรับแต่ละหน้า

### การใช้งานระบบออนไลน์ (Live Demo)

| บริการ | ลิงก์ |
| --- | --- |
| ระบบออนไลน์ — Vercel | [เปิดระบบบริหารจัดการกิจกรรม](https://674259009-7153403-final-d.vercel.app/) |
| Backend — Render | [Backend Base URL](https://event-backend-5m5f.onrender.com) |
| Events API | [GET /api/events](https://event-backend-5m5f.onrender.com/api/events) |
| Swagger API Documentation | [Swagger UI — getEvents](https://event-backend-5m5f.onrender.com/api/events/docs#/Events/getEvents) |
| OpenAPI JSON | [API specification](https://event-backend-5m5f.onrender.com/api-docs.json) |

Frontend, Backend, Events API และ Swagger URL เป็นข้อมูล deployment ที่ผู้ใช้ยืนยันให้มา ส่วน OpenAPI JSON เป็น URL ที่ประกอบจาก Backend URL และ route ในซอร์สโค้ด การเปิด Frontend, Events API และ Swagger ผ่านเครื่องมือเว็บในรอบจัดทำเอกสารนี้ไม่สำเร็จ จึงยังไม่ยืนยันสถานะ HTTP หรือการทำงานออนไลน์จากการตรวจครั้งนี้ การเปิด Backend `/` ไม่ใช่ health check เพราะโค้ดไม่มี route ดังกล่าว

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

Frontend ใช้ `event-dashboard.tsx` ควบคุมสถานะหน้าจอและเรียก API, `event-list.tsx` แสดงรายการ, `event-form.tsx` รับข้อมูล และ `event-dialogs.tsx` แสดงรายละเอียด/ฟอร์ม/ยืนยันลบ การ rewrite อยู่ใน `next.config.ts` ไม่พบ `vercel.json`, `render.yaml`, migration directory หรือไฟล์ทดสอบใน repository ที่ตรวจ

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

Controller ตรวจซ้ำก่อนบันทึก โดยข้อความต้องเป็น string ที่มีอักขระนอกเหนือจากช่องว่าง วันที่ต้องมีอยู่จริง และ `status` ถ้าส่งมาต้องเป็น boolean Frontend trim ข้อความก่อนส่งและไม่รับปี `0000` ขณะที่ Backend ไม่มีเงื่อนไขห้ามปี `0000` แยกไว้อย่างเดียวกับ Frontend

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
| DELETE | `/api/events/:id` | ลบกิจกรรม ไม่มี response body | **204** |
| GET | `/api/events/docs` | Swagger UI | 200 ตามโค้ด |
| GET | `/api-docs.json` | OpenAPI 3.0.3 specification | 200 ตามโค้ด |

สถานะในตารางเป็นพฤติกรรมที่เขียนไว้ในโค้ด ไม่ใช่ผลทดสอบ Production ไม่มี PATCH endpoint และ `PUT` ไม่ใช่ partial update

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

GET list ตอบ `{"data": [ ... ]}` โดยแต่ละสมาชิกมีโครงสร้างเหมือน object ใน `data` ด้านบน หากไม่มีรายการตอบ `{"data": []}` ส่วน DELETE สำเร็จตอบ **204 พร้อม body ว่าง**

### Query parameters และการกรอง

| Parameter | Frontend ส่งอย่างไร | พฤติกรรม Backend ปัจจุบัน |
| --- | --- | --- |
| `search` | คำค้นที่ trim แล้ว | ไม่อ่าน query; ยังคืนรายการทั้งหมด |
| `category` | หมวดหมู่ที่เลือก | ไม่อ่าน query; ยังคืนรายการทั้งหมด |

ตัวอย่าง `GET /api/events?search=Excel&category=อบรม` ยังไม่กรองที่ server `eventApi.getAll()` จะกรองชื่อกิจกรรม/ผู้จัดแบบ substring ไม่สนตัวพิมพ์เล็กใหญ่ แล้วกรองหมวดหมู่แบบตรงค่าใน Frontend อีกครั้ง การกรองสถานะและเรียงลำดับเพิ่มเติมทำใน dashboard ไม่มี server-side pagination

### Error responses

| HTTP | ตัวอย่าง body | เงื่อนไขตามโค้ด |
| --- | --- | --- |
| 400 | `{"error":"Invalid event ID"}` | ID ไม่ถูกต้อง |
| 400 | `{"error":"Invalid event input"}` | required fields, type, ความยาว, หมวดหมู่, วันที่ หรือ Sequelize validation ไม่ผ่าน |
| 400 | `{"error":"Invalid JSON request"}` | JSON request ไม่ถูกต้อง |
| 404 | `{"error":"Event not found"}` | ไม่พบกิจกรรม |
| 404 | `{"error":"Route not found"}` | ไม่มี route ที่เรียก |
| 500 | `{"error":"Internal server error"}` | ข้อผิดพลาดที่ไม่เข้าเงื่อนไขข้างต้น เช่น database query ล้มเหลวหลังเปิด server |

Backend ไม่ส่งรายละเอียด database error ให้ client หากเชื่อมฐานข้อมูลไม่ได้ตั้งแต่ startup ระบบจะไม่เปิด listener จึงไม่ใช่กรณีตอบ HTTP 500 จาก server ที่พร้อมใช้งาน Frontend อ่าน error key `message` แต่ Backend ส่ง `error` จึงมักแสดงข้อความ fallback พร้อม HTTP status แทนข้อความเฉพาะจาก Backend

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

ข้อที่ยังขาดหรือแตกต่าง: ไม่ใช้ Vite, Backend ไม่กรอง query, ไม่พบ automated tests และข้อความ error ระหว่าง API กับ Frontend ใช้ key ไม่ตรงกัน ยังไม่อ้างว่าการทำงาน end-to-end ผ่านการทดสอบ

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

ไม่พบ `vercel.json` หรือ metadata deployment ที่ยืนยันค่า dashboard รายการ root/build/output ข้างต้นเป็นค่าตั้งต้นที่อนุมานได้จากโค้ดและ scripts ต้องตรวจ dashboard ว่าใช้จริงตามนี้ แล้ว redeploy เมื่อเปลี่ยน API destination Production ไม่ใช้ `bun run start` เป็น Vercel start command ส่วนการรัน production build เองใช้ `bun run build` แล้ว `bun run start` ภายใน `frontend/`

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

ไม่พบ `render.yaml` จึงยังไม่ยืนยัน runtime และคำสั่งที่ตั้งจริงบน Render Dashboard หากใช้ Docker runtime ไม่ต้องนำ Build/Start Command ของ native runtime ไปตั้งทับ Dockerfile ทุกครั้งที่เริ่ม server จะ authenticate, sync และตรวจ marker ก่อน seed ไม่พบ health endpoint แยก; Compose ใช้ GET `/api/events` ตรวจ readiness

### Database และหลักฐาน persistence

| ประเด็น | หลักฐานที่พบ | ข้อจำกัด |
| --- | --- | --- |
| เก็บข้อมูลจริง | Controller เรียก `Event.findAll/findByPk/create/update/destroy` ผ่าน Sequelize PostgreSQL | ยืนยัน implementation ไม่ใช่ผลทดสอบฐานข้อมูล Production |
| Local persistence | `pgdata:/var/lib/postgresql/data` ใน Compose | ยังไม่ได้ทดสอบ restart ในรอบนี้ |
| Seed persistence | `seed_runs` marker และ events commit ใน transaction เดียวกัน พร้อม advisory lock | มี 12 seed records ในซอร์ส; ยังไม่ยืนยันจำนวนปัจจุบันบน Production |
| Neon support | `DATABASE_PROVIDER=neon` เลือก secure WebSocket driver | ไม่ยืนยันว่า Production ใช้ Neon |
| Production provider | **TODO:** ยืนยันชื่อ provider และการตั้งค่า backup/retention จาก dashboard โดยไม่เปิดเผย connection string | URL ของ Render/Vercel ไม่พิสูจน์ provider หรือ persistence |

ฐานข้อมูล Production ต้องอยู่ใน PostgreSQL service ที่เก็บข้อมูลถาวรแยกจาก filesystem ของ Backend ใช้ `DATABASE_URL` ใน secrets/environment ของ Render และไม่บันทึก credentials ลง README การยืนยัน persistence ต้องบันทึกข้อมูลทดสอบแล้วตรวจซ้ำหลัง refresh และ restart/redeploy ตามหัวข้อถัดไป

## 13. การตรวจสอบและทดสอบ

### สิ่งที่ตรวจแล้วในรอบจัดทำเอกสาร

- อ่าน package scripts, entry point, database configuration, models, controllers, routes, seed, Frontend API client, validation, dialogs, Dockerfiles และ Compose
- ยืนยันจากโค้ดว่ามี REST CRUD 5 endpoints และ DELETE ใช้ 204
- ยืนยันจากโค้ดว่าการค้นหา/กรองอยู่ที่ Frontend และ seed มี 12 รายการครบ 3 หมวด ทั้งเผยแพร่และฉบับร่าง
- ตรวจชื่อ environment และจัดทำ example ด้วย placeholder โดยไม่คัดลอกค่า secret
- ตรวจว่าไม่มี screenshots, `vercel.json`, `render.yaml` หรือ test files ใน repository ที่ตรวจ
- ทดลองเปิด Frontend / Events API / Swagger ด้วยเครื่องมือเว็บแล้วเข้าถึงไม่ได้ ผลนี้ยังไม่ใช่หลักฐานว่า Production ล่ม

**ยังไม่ได้รัน application, build, lint, typecheck หรือทดสอบ HTTP/ฐานข้อมูลในรอบนี้** ไม่ได้ติดตั้ง packages และไม่ได้ส่ง POST, PUT หรือ DELETE ไปยัง Production

### คำสั่งตรวจที่มีใน package scripts

Backend:

```sh
cd backend
bun run typecheck
bun run db:check:local
```

Frontend:

```sh
cd frontend
bun run lint
bun run build
```

Backend มี script `bun test` แต่ **ไม่พบไฟล์ทดสอบ** จึงไม่ถือว่ามี test suite ที่ผ่านแล้ว `backend/README.md` เดิมกล่าวถึง `tests/event-seed.integration.test.ts` ซึ่งไม่มีใน checkout นี้ และกล่าวถึง `/api-docs` แต่ route จริงคือ `/api/events/docs` ให้ใช้ paths ตามเอกสาร root ฉบับนี้ ไม่มีการแก้ README ย่อยเพราะอยู่นอกขอบเขตไฟล์ที่อนุญาต

### แผนทดสอบที่ยังต้องทำ

ทดสอบ mutation บนฐานข้อมูลทดสอบก่อน และบันทึกผลจริงพร้อมวันเวลา/สภาพแวดล้อม อย่านับตัวอย่างผลลัพธ์ในเอกสารเป็นผลทดสอบ

| การทดสอบ | วิธีตรวจ / ผลที่คาดจากโค้ด | สถานะ |
| --- | --- | --- |
| Read | GET list ได้ 200 และ `{data: [...]}`; GET ID ที่มีอยู่ได้ 200 | ยังไม่ทดสอบ |
| Create | ส่ง POST ที่ถูกต้องได้ 201; จด ID แล้วอ่านกลับได้ | ยังไม่ทดสอบ |
| Update | PUT ส่ง required fields ครบได้ 200; GET ยืนยันข้อมูลใหม่; ทดลองละ status ให้คงค่าเดิม | ยังไม่ทดสอบ |
| Delete | UI ยกเลิกต้องไม่ลบ; ยืนยันลบได้ 204; GET ID เดิมได้ 404 | ยังไม่ทดสอบ |
| Search / Filter | ค้นชื่อ/ผู้จัดและกรอง 3 หมวด/สถานะใน UI ร่วมกัน; ตรวจ empty state และ reset | ยังไม่ทดสอบ |
| API query | เปรียบเทียบ GET พร้อม search/category กับ list; ตามโค้ดยังคืนทั้งหมด | ยังไม่ทดสอบ runtime; ยังไม่มี server filtering |
| Validation / 400 | ส่งข้อความว่าง/ยาวเกิน, หมวดผิด, วันที่ไม่มีจริง, status เป็น string, ID ผิด หรือ JSON เสีย | ยังไม่ทดสอบ |
| Not found / 404 | ใช้ ID ที่ตรวจว่าไม่มีจริง หรือ route ที่ไม่มี | ยังไม่ทดสอบ |
| Server error / 500 | จำลอง query failure ในสภาพแวดล้อมทดสอบหลัง server พร้อมใช้งาน แล้วตรวจ error body และ UI | ยังไม่ทดสอบ |
| Loading / Network error | ใช้ network throttling/offline ตรวจ spinner, retry, toast และป้องกันกดซ้ำ | ยังไม่ทดสอบ |
| Seed | เริ่มด้วยฐานข้อมูลทดสอบใหม่ได้ 12 รายการ; restart ไม่เพิ่มซ้ำ; แก้/ลบแล้วไม่ถูก seed ทับ | ยังไม่ทดสอบ |
| Persistence | สร้าง/แก้ไขข้อมูล อ่านกลับหลัง refresh และ restart Backend; Docker down/up โดยเก็บ volume แล้วอ่านซ้ำ | ยังไม่ทดสอบ |
| Online deployment | ตรวจ Vercel → proxy → Render → DB, Swagger, CORS และ CRUD ด้วยข้อมูลทดสอบที่ได้รับอนุญาต | ยังไม่ทดสอบสำเร็จ |

ตัวอย่างคำสั่งอ่านอย่างเดียวสำหรับตรวจในเครื่องหลังเปิด Backend แล้ว:

```sh
curl -i http://localhost:4000/api/events
curl -i http://localhost:4000/api/events/invalid
curl -i http://localhost:4000/api-docs.json
```

คำสั่งข้างต้นเป็นขั้นตอนสำหรับผู้ตรวจ ไม่ใช่รายการคำสั่งที่รายงานว่ารันผ่านแล้ว

## 14. Checklist เทียบข้อกำหนดข้อสอบ

`[x] ครบ` หมายถึงตรวจพบหลักฐานตามที่ระบุในโค้ด/ไฟล์ ส่วน `[ ] ยังไม่ครบ` และ `[ ] ยังไม่ยืนยัน` แยกสิ่งที่ขาดจากสิ่งที่ต้องตรวจ runtime การมี implementation ไม่ได้หมายถึงผ่าน end-to-end test

- [x] **ครบ:** แยก `frontend/` และ `backend/` พร้อม package scripts และ source structure
- [ ] **ยังไม่ครบ:** React + Vite — repository ใช้ Next.js + React
- [x] **ครบ:** Sequelize Event model มีฟิลด์หลักและชนิดตรง schema พร้อม validation/timestamps
- [x] **ครบ:** มี GET list, GET detail, POST, PUT, DELETE ใน routes
- [ ] **ยังไม่ครบตาม status ที่ระบุในโจทย์:** DELETE ใช้ 204 แทน 200
- [x] **ครบในโค้ด:** UI ดูรายการ/รายละเอียด เพิ่ม แก้ไข ลบพร้อมยืนยัน
- [x] **ครบในโค้ด Frontend:** Search และ category filtering รวมถึง status filtering
- [ ] **ยังไม่ครบ:** Backend search/category query filtering
- [x] **ครบในโค้ด:** Form, controller และ model validation
- [x] **ครบในโค้ด:** Loading, pending, empty/error states, retry และ toast
- [x] **ครบในซอร์ส seed:** อย่างน้อย 10 รายการ — มี 12 รายการ
- [x] **ครบในซอร์ส seed:** 3 หมวด หมวดละ 4 รายการ
- [x] **ครบในซอร์ส seed:** เผยแพร่ 6 รายการและฉบับร่าง 6 รายการ
- [x] **ครบ:** `frontend/.env.example` และ `backend/.env.example` พร้อม ignore ไฟล์ secrets
- [ ] **ยังไม่ครบ:** ภาพหน้าจอทั้ง 4 ไฟล์
- [x] **ครบตามข้อมูลผู้ใช้:** มี URL deployment ของ Vercel และ Render พร้อมลิงก์ API/Swagger
- [ ] **ยังไม่ยืนยัน:** เข้าถึง Vercel และ Render ได้จริง และ proxy/CORS ทำงานครบใน Production
- [ ] **ยังไม่ยืนยัน:** ค่า deployment จริงใน dashboard และ Production database provider
- [x] **ครบในโค้ด:** PostgreSQL persistence ผ่าน Sequelize; Docker มี named volume และ seed marker
- [ ] **ยังไม่ยืนยัน:** Persistence หลัง restart/redeploy และจำนวน seed ที่มีจริงในฐานข้อมูล
- [ ] **ยังไม่ยืนยัน:** CRUD, filtering, validation, HTTP 400/404/500 และ online tests ผ่านจริง
- [ ] **ยังไม่ยืนยัน:** ชื่อ repository ตรงรูปแบบที่อาจารย์กำหนด — ปัจจุบันลงท้าย `_Final_4` ขณะที่ชุดโจทย์คือ D; ไม่พบเอกสารรูปแบบชื่อที่ยืนยันได้
- [ ] **ยังไม่ครบ:** ชื่อผู้จัดทำ; ยืนยันรหัสนักศึกษาจากเจ้าของโครงงานก่อนส่ง

### ข้อมูลที่ต้องเติมก่อนส่ง

1. ชื่อผู้จัดทำและการยืนยันรหัสนักศึกษา/รูปแบบชื่อ repository
2. ภาพหน้าจอจริงทั้ง 4 ไฟล์ตามหัวข้อ 11
3. หลักฐานเข้าถึง URL Production และการทดสอบ UI/API โดยไม่เปิดเผย secrets
4. Database provider ที่ใช้จริง พร้อมหลักฐาน persistence หลัง restart/redeploy
5. ค่าตั้ง Vercel/Render dashboard และบันทึกผลทดสอบตามหัวข้อ 13

URL Production หลักได้รับจากผู้ใช้ครบแล้ว จึงไม่มีการสร้าง URL สมมติ งานรอบนี้ปรับเฉพาะเอกสาร ไฟล์ environment examples และข้อยกเว้น `.gitignore` ที่จำเป็น โดยไม่แก้ business logic
