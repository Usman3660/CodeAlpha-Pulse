# ⚡ Pulse Social — Modern Full-Stack Social Network

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-node:sqlite%20WAL-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20CDN-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Pulse Social** is a sleek, ultra-responsive, full-stack social network web application built with modern Node.js, Express, native SQLite, and a reactive glassmorphic Single Page Application (SPA) frontend with 3D interactive physics and dark-mode aesthetics.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema](#-database-schema)
- [REST API Reference](#-rest-api-reference)
- [Security & Performance](#-security--performance)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
- [Client-Side Architecture](#-client-side-architecture)
- [Development & Verification](#-development--verification)
- [License](#-license)

---

## 🌟 Overview

Pulse Social delivers an engaging social networking experience modeled after modern platforms like X/Twitter and Threads, enhanced with custom 3D card tilt physics, particle canvas backgrounds, dynamic feed filtering, nested discussions, user following graphs, and an instant profile switcher for simulating multiple users.

The backend is structured according to a clean layered architecture (**Controller-Service-Repository**) powered by Node.js native `node:sqlite` with Write-Ahead Logging (`WAL`) mode for high concurrency and zero external database server dependencies.

---

## ✨ Key Features

### 1. 📰 Dynamic Feed & Multi-View Filtering
- **For You**: Algorithmic timeline sorted chronologically with rich engagement metadata.
- **Following Feed**: Personalized stream displaying only posts from creators the active user follows.
- **Trending Feed**: Real-time hot feed ranked by engagement score (sum of likes and comments).
- **Topic / Tag Filtering**: Filter posts instantly by clicking hashtags (e.g. `#tech`, `#design`, `#ai`, `#coding`).
- **Live Search**: Instant multi-attribute search filtering by post content, author name, handle, and hashtag.

### 2. ✍️ Rich Post Creation & Interaction
- **Post Composer**: Create posts with rich text, image previews, and hashtag categorization.
- **Instant Like System**: Like/unlike posts with optimistic UI updates and live like counters.
- **Nested Comments**: View discussions, add replies in real time, and track conversation timestamps.
- **Post Deletion**: Delete authored posts with instant timeline refresh.

### 3. 👥 Social Follow Graph & Recommendations
- **Who to Follow**: Personalized discovery widget suggesting users you haven't followed yet.
- **One-Click Follow/Unfollow**: Dynamically manage follower/following relationships.
- **Real-Time Follower Counters**: Instantly updates profile badges and following feeds.

### 4. 👤 User Profiles & Multi-User Switcher
- **Profile Modals**: Detailed user cards displaying bio, handles, avatar, banner, followers, following counts, and personal post timelines.
- **Active Profile Switcher**: Switch between demo user identities (`u1`, `u2`, `u3`, `u4`) on the fly directly from the UI to test multi-user interactions seamlessly.

### 5. 🎨 Glassmorphic & 3D Interactive Design
- **Custom 3D Tilt**: Interactive perspective tilt and glare effects on post cards responding to cursor hover.
- **Canvas Particle Background**: Floating ambient particles creating depth.
- **Dark Mode Aesthetic**: Custom color palette featuring Indigo, Violet, Neon Rose, and Emerald accents with glassmorphism backdrops.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                       │
│  (Tailwind CSS + Modular ES6 + 3D Tilt + Reactive Store)│
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON API
┌────────────────────────────▼────────────────────────────┐
│                    Express.js App                       │
│  ├── Security (Helmet, CORS, Rate Limiting, Sanitizer)  │
│  ├── Auth Middleware (x-user-id header resolution)      │
│  ├── Controllers (User, Post, Social)                   │
│  ├── Services (Business Logic & Aggregation)            │
│  └── Repositories (Data Access Layer)                   │
└────────────────────────────┬────────────────────────────┘
                             │ Prepared SQL Statements
┌────────────────────────────▼────────────────────────────┐
│              Embedded SQLite (DatabaseSync)             │
│            pulse.sqlite (WAL Mode Enabled)              │
└─────────────────────────────────────────────────────────┘
```

### Backend
- **Node.js**: Modern ES Modules (`"type": "module"`).
- **Express.js (v4.21+)**: Fast, unopinionated HTTP web framework.
- **Native SQLite (`node:sqlite` DatabaseSync)**: High-speed, zero-config relational storage.
- **Helmet**: Secures HTTP response headers with Content-Security-Policy.
- **Express Rate Limit**: Protects endpoints against brute force and abuse (100 req / 15 min).
- **Validator**: Robust string sanitization and XSS protection.

### Frontend
- **HTML5 & Vanilla ES6+ Modules**: Clean, framework-free architecture without complex build steps.
- **Tailwind CSS**: Modern utility-first styling with dark mode support.
- **FontAwesome 6**: Comprehensive iconography.
- **Google Fonts**: Modern typography featuring *Plus Jakarta Sans* and *Inter*.

---

## 📂 Project Directory Structure

```text
d:/Code Alpha/project 1/
├── .env.example               # Example environment variable configuration
├── package.json               # Project manifest, dependencies, and start scripts
├── package-lock.json          # Dependency lockfile
├── server.js                  # Application HTTP server entrypoint
├── pulse.sqlite               # Primary SQLite database file (auto-seeded)
├── pulse.sqlite-wal           # SQLite Write-Ahead Log file
├── pulse.sqlite-shm           # SQLite Shared Memory index
│
├── src/                       # Backend Source Code
│   ├── app.js                 # Express application configuration & middleware setup
│   ├── config/                # Core configurations
│   │   ├── db.js              # SQLite connection, DDL table migrations & auto-seed
│   │   ├── env.js             # Environment variables parser & validator
│   │   └── security.js        # Helmet, CORS, and rate limiting rules
│   ├── controllers/           # Express request & response handlers
│   │   ├── post.controller.js # Feed, post creation, like, comment, delete
│   │   ├── social.controller.js # Trending topics, who-to-follow, follow/unfollow
│   │   └── user.controller.js # User profile queries
│   ├── data/
│   │   └── seed.js            # Initial seed dataset (users, posts, comments)
│   ├── middleware/            # Custom Express middleware
│   │   ├── auth.middleware.js # Resolves active user from headers / env
│   │   ├── errorHandler.middleware.js # Centralized JSON error responder
│   │   ├── rateLimiter.middleware.js # Rate limit handler
│   │   └── sanitize.middleware.js # Request payload sanitizer
│   ├── models/                # Domain entities & schema factories
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── repositories/          # Direct database access with prepared statements
│   │   ├── commentRepository.js
│   │   ├── postRepository.js
│   │   └── userRepository.js
│   ├── routes/                # Express API route declarations
│   │   ├── api.routes.js      # Main /api/v1 router
│   │   ├── post.routes.js     # /api/v1/posts routes
│   │   ├── social.routes.js   # /api/v1/social routes
│   │   └── user.routes.js     # /api/v1/users routes
│   ├── services/              # Business logic & data enrichment
│   │   ├── authService.js
│   │   ├── postService.js
│   │   └── socialService.js
│   └── utils/                 # Helpers (security, time, ui)
│
├── public/                    # Frontend Client SPA Assets
│   ├── index.html             # Single Page Application HTML shell
│   ├── css/
│   │   ├── theme.css          # Glassmorphism, scrollbars, and custom animations
│   │   └── cards3d.css        # 3D perspective transforms & glowing borders
│   └── js/
│       ├── app.js             # Main frontend bootstrap & DOM controller
│       ├── api/
│       │   └── apiClient.js   # Client HTTP wrapper with header injection
│       ├── components/        # Reusable UI component renderers
│       │   ├── composer.js    # Post creation composer widget
│       │   ├── feed.js        # Timeline layout & tabs
│       │   ├── postCard.js    # Post rendering, likes, and comment threads
│       │   └── profileSwitcher.js # Active user switching component
│       ├── effects/
│       │   ├── threeBackground.js # Canvas floating particle effect
│       │   └── tilt3d.js      # Pointer-driven 3D card tilt physics
│       └── state/
│           └── store.js       # Client reactive state management store
└── styles/
    └── app.css                # Supplementary utility styles
```

---

## 🗄️ Database Schema

The database utilizes SQLite with relational tables and cascading foreign keys:

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar TEXT,
  banner TEXT,
  bio TEXT
);

-- Follow relationships (many-to-many)
CREATE TABLE follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- Posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  tag TEXT,
  timestamp INTEGER NOT NULL
);

-- Post Likes (many-to-many)
CREATE TABLE post_likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);
```

> **Note:** On the first run, if the `users` table is empty, `src/config/db.js` automatically populates realistic mock users, follows, posts, likes, and comments from `src/data/seed.js`.

---

## 🔌 REST API Reference

Base URL: `http://localhost:3000/api/v1`

### Authentication Headers
For authenticated endpoints, pass the user ID using the `x-user-id` header:
```http
x-user-id: u1
```

---

### 1. System Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Returns application health and environment info | No |

---

### 2. Users API (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/users` | Get a list of all users with followers/following arrays | No |
| `GET` | `/users/:id` | Get details for a specific user ID | No |

---

### 3. Posts API (`/api/v1/posts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/posts` | Get all posts with hydrated author, likes, and comment threads | No |
| `POST` | `/posts` | Create a new post | **Yes** |
| `POST` | `/posts/:id/like` | Toggle like/unlike on a post | **Yes** |
| `POST` | `/posts/:id/comments` | Add a comment to a post | **Yes** |
| `DELETE`| `/posts/:id` | Delete a post by ID | **Yes** |

#### Create Post Payload Example:
```json
{
  "content": "Exploring the capabilities of Node.js SQLite DatabaseSync! 🚀",
  "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000",
  "tag": "tech"
}
```

#### Add Comment Payload Example:
```json
{
  "content": "This looks super fast and clean!"
}
```

---

### 4. Social API (`/api/v1/social`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/social/trending` | List trending hashtags and their post counts | No |
| `GET` | `/social/who-to-follow`| Get recommended users to follow for the current user | **Yes** |
| `POST` | `/social/follow/:id` | Toggle follow/unfollow for a target user ID | **Yes** |

---

## 🛡️ Security & Performance

- **Helmet Header Hardening**: Disables `X-Powered-By`, enables `X-Content-Type-Options`, `X-Frame-Options`, and configures Content Security Policy (CSP) for Google Fonts, CDNs, and inline styles.
- **Input Sanitization**: Automatically strips harmful HTML characters, trims whitespaces, and sanitizes payloads across all `req.body` inputs.
- **Rate Limiting**: Protects backend resources using `express-rate-limit` with informative HTTP 429 status codes.
- **Optimized SQLite Concurrency**: Configured with `PRAGMA journal_mode = WAL` (Write-Ahead Logging) and `PRAGMA foreign_keys = ON` for fast non-blocking reads during writes.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v22.0.0` or later (required for native `node:sqlite` `DatabaseSync` support).
- **npm**: `v10.0.0` or later.

### Installation & Setup

1. **Clone or open the repository**:
   ```bash
   cd "d:/Code Alpha/project 1"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file or copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the application**:
   - For regular production mode:
     ```bash
     npm start
     ```
   - For development mode:
     ```bash
     npm run dev
     ```

5. **Open in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Configure your environment parameters in `.env`:

| Variable | Description | Default |
|---|---|---|
| `PORT` | The port number on which the Express server listens | `3000` |
| `NODE_ENV` | Running environment (`development` or `production`) | `development` |
| `APP_NAME` | The application display name | `Pulse Social` |
| `SIMULATED_USER_ID`| Default fallback user identity if header is omitted | `u1` |

---

## 💻 Client-Side Architecture

The frontend is implemented as a lightweight, reactive Single Page Application (SPA):

- **`store.js`**: Centralized state management holding `currentUser`, `users`, `posts`, `activeTag`, `currentTab`, and `searchQuery`. Components subscribe to state changes to update the DOM reactively.
- **`apiClient.js`**: Handles network communication, extracts the active user ID from `localStorage` (`pulse_active_user_id`), and attaches it to request headers automatically.
- **`tilt3d.js`**: Calculates mouse coordinates over cards and applies smooth dynamic 3D CSS perspective transforms (`rotateX`, `rotateY`, and specular highlights).
- **`threeBackground.js`**: Canvas-based interactive particle animation system that runs unobtrusively in the backdrop.

---

## 🧪 Development & Verification

### Checking Health
You can verify the backend is running properly via `curl`:
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "ok": true,
  "app": "Pulse Social",
  "env": "development"
}
```

### Fetching Posts
```bash
curl http://localhost:3000/api/v1/posts
```

### Creating a Post via CLI
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: u1" \
  -d "{\"content\":\"Testing Pulse Social API!\",\"tag\":\"tech\"}"
```

---

## 📜 License

This project is licensed under the MIT License. Feel free to use, modify, and build upon it!
