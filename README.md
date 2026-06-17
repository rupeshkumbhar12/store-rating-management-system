# Store Rating Management System

A full-stack store rating application with three roles: **Admin**, **User**, and **Store Owner**.

## Tech Stack

- Frontend: React.js (Vite)
- Backend: Express.js
- Database: MySQL
- ORM: Sequelize
- Authentication: JWT

## Features

### Admin

- Dashboard statistics
- Add/View Users
- Add/View Stores
- Filter and sort users/stores

### User

- Register/Login
- Search stores
- Submit ratings (1-5)
- Update ratings
- Change password

### Store Owner

- View average rating
- View users who rated their store
- Change password

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

Create MySQL database:

```sql
CREATE DATABASE store_rating_db;
```

## Authentication

JWT-based authentication with role-based authorization.

## Author

Rupesh Kumbhar
