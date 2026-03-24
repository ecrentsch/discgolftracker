# 🥏 RoundTracker

A full-stack disc golf round tracker with social features, a shared course database, bag management, and public profiles.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access token in-memory + httpOnly refresh cookie) |
| File Uploads | Multer (local disk) |
| Data Fetching | TanStack Query |

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+ (running locally or remote)
- **npm** 9+

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE discgolftracker;"

# Or using createdb
createdb discgolftracker
```

### 3. Configure the server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/discgolftracker"
JWT_ACCESS_SECRET="any-long-random-string"
JWT_REFRESH_SECRET="another-different-long-random-string"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 4. Configure the client environment

```bash
cp client/.env.example client/.env
```

The defaults work for local development.

### 5. Create the uploads directory

```bash
mkdir -p server/uploads/avatars
```

### 6. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
cd ..
```

### 7. Seed the database

```bash
npm run db:seed
```

This creates 14 disc golf courses near Midland, MI and 2 test accounts:

| Username | Email | Password |
|---|---|---|
| `discmaster` | disc@test.com | password123 |
| `fairwayace` | ace@test.com | password123 |

### 8. Start the development servers

```bash
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

## Features

### Authentication
- Sign up with username, email, and password
- JWT auth with silent session refresh on page load

### Profiles
- Public profiles at `/profile/:username`
- Stats: total rounds, throws, avg score vs par, best round, favorite course, favorite disc
- Upload a profile picture
- Tabs: Rounds | Bag | Friends

### Social
- Send, accept, and decline friend requests
- Dashboard feed shows friends' recent rounds
- Search any user by username

### Round Logging
- Searchable course dropdown — par auto-fills, never re-entered
- Score shown as +/- vs par in real-time as you type
- Weather: Sunny / Cloudy / Windy / Rainy / Cold
- Optional notes

### Course Database
- Shared globally — any user can add a course
- 1-5 star ratings + optional review
- Course detail: avg rating, all reviews, recent players

### Bag Builder
- Discs: name, brand, plastic, weight, speed, glide, turn, fade
- Auto-labeled: Putter / Mid-range / Fairway / Distance Driver

## Seeded Courses Near Midland, MI

All courses verified via PDGA course directory and UDisc.

| Course | City | Holes | Par |
|---|---|---|---|
| Chippewa Banks Disc Golf Course | Midland | 18 | 54 |
| Midland College Disc Golf Course | Midland | 9 | 27 |
| The Jungle at Sanford Lake Park | Sanford | 18 | 58 |
| Wickes Woods Disc Golf Course | Saginaw | 18 | 54 |
| Thompson Memorial Disc Golf Course | Saginaw | 9 | 27 |
| Muellers Valley View | Saginaw | 18 | 54 |
| Deerfield Park - Deerfield Course | Mount Pleasant | 18 | 55 |
| Deerfield Park - Wildwood Course | Mount Pleasant | 18 | 56 |
| Central Michigan University Disc Golf | Mount Pleasant | 18 | 54 |
| Putz Putt and Approach Disc Golf Park | Bay City | 9 | 27 |

## Project Structure

```
discgolftracker/
├── package.json          # root npm workspace
├── shared/               # shared TypeScript types
├── server/               # Express + Prisma backend
│   ├── prisma/           # schema.prisma + seed.ts
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── lib/
└── client/               # React + Vite frontend
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── lib/
```

## Useful Commands

```bash
npm run dev          # Start both client + server in dev mode
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run build        # Build for production
cd server && npx prisma migrate reset   # Reset + re-seed DB
```
