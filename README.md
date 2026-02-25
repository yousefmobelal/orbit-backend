# 🚀 Orbit: Gamified Productivity — Core API & Galaxy Engine

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express.js-5.x-blue?logo=express)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://mongoosejs.com/) [![Zod](https://img.shields.io/badge/Validation-Zod-8A2BE2?logo=zod)](https://zod.dev/) [![JWT](https://img.shields.io/badge/Auth-JWT-yellow?logo=JSON-Web-Tokens)](https://jwt.io/)

---

## 🌌 Orbit Backend — Core API & Galaxy Engine

Welcome to the backend of **Orbit** — the engine that powers your cosmic productivity journey! This service manages all core logic, gamification, authentication, and data for the Orbit platform.

---

## 🛠️ Tech Stack

- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** [Zod](https://zod.dev/)
- **Other:** Helmet, CORS, Pino, Cloudinary

---

## ✨ Core Features

- **Gamification Engine:**
  - XP calculation, leveling, streaks, and progression logic for users and planets.
  - Task completion rewards, recurring task cooldowns, and first-task bonuses.
- **Planet & Orbit Data Management:**
  - CRUD for planets, tasks, themes, and narratives.
  - User-centric planetary systems and cosmic logs.
- **User Authentication & Protected Routes:**
  - Secure JWT-based auth, refresh tokens, and route protection middleware.
- **Validation:**
  - Robust request validation using Zod schemas for all endpoints.
- **Theming & Cloudinary Integration:**
  - Dynamic theme management and avatar uploads.

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/yousefmobelal/orbit-backend.git
   cd orbit-backend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root with:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGO_URL=your_mongodb_url
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=30d
   CLOUD_NAME=your_cloudinary_cloud
   API_KEY=your_cloudinary_key
   API_SECRET=your_cloudinary_secret
   OPENAI_API_KEY=your_openai_key (optional)
   ```
4. **Run the server:**
   ```sh
   npm run dev
   ```

---

## 🗄️ Database & Seeding

- **MongoDB** is used for all data storage.
- To seed default themes:
  ```sh
  npm run seed:themes
  ```

---

## 📚 API Documentation

- All endpoints are prefixed with `/api/`
- (Optional) [Swagger or Postman collection link here if available]
- Example endpoints:
  - `POST /api/auth/register` — Register a new user
  - `POST /api/auth/login` — Login and receive JWT
  - `GET /api/planet` — Get all user planets
  - `POST /api/task` — Create a new task

---

## 📁 Project Structure

```
src/
  app.ts                # Express app setup
  index.ts              # Entry point
  config/               # DB, env, progression, theme config
  controllers/          # Route controllers (auth, planet, task, etc.)
  middleware/           # Auth middleware
  models/               # Mongoose models (User, Planet, Task, etc.)
  routes/               # Express routers
  services/             # Business logic (XP, progression, etc.)
  types/                # TypeScript types
  utils/                # Helpers (validation, error handling, logger)
  validation/           # Zod schemas
```

---

## 💫 Contributing

PRs and issues welcome! For major changes, please open an issue first.

---

## 🪐 License

[ISC](./LICENSE)
