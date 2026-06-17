# Store Rating Management System

A full-stack store rating application with three roles: **Admin**, **User**, and **Store Owner**.

## Tech Stack

- **Frontend:** React.js (Vite)
- **Backend:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT

## Project Structure

```
store-rating-app/
├── backend/          # Express API server
├── frontend/         # React Vite app
└── database/         # SQL schema
```

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

Create the database and tables:

```sql
CREATE DATABASE store_rating_db;
```

Or run the full schema:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Default Admin Account

On first startup, a default admin is seeded:

- **Email:** admin@store.com
- **Password:** Admin@123

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user/owner |
| POST | `/api/auth/login` | Login |
| PUT | `/api/auth/change-password` | Change password (auth required) |

### Admin (ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| POST | `/api/admin/users` | Add user |
| GET | `/api/admin/users` | List users (filter/sort) |
| GET | `/api/admin/users/:id` | User details |
| POST | `/api/admin/stores` | Add store |
| GET | `/api/admin/stores` | List stores (filter/sort) |

### User (USER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List stores with ratings |
| GET | `/api/stores?name=abc` | Search stores |
| POST | `/api/ratings` | Submit rating |
| PUT | `/api/ratings/:id` | Update rating |

### Store Owner (OWNER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/average-rating` | Average store rating |
| GET | `/api/owner/ratings` | Users who rated store |

## Validation Rules

- **Name:** 20–60 characters
- **Address:** max 400 characters
- **Email:** valid email format
- **Password:** 8–16 characters, 1 uppercase, 1 special character

## Features

- JWT authentication with role-based access
- Admin dashboard with stats, user/store management
- Sorting and filtering on admin tables
- User store search and rating submission/update
- Store owner average rating and rated users view
- Responsive UI

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Railway (MySQL)

Set `VITE_API_URL` in frontend to your deployed backend URL.
