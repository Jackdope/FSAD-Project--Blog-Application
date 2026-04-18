# Personal Blog Web Application

A full-stack personal blog application built with Spring Boot and vanilla JavaScript. Features user authentication with email verification, JWT-based authorization, and complete blog management system.

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Quick Setup
```bash
# 1. Create database
mysql -u root -p < schema.sql

# 2. Set environment variables (PowerShell)
$env:DB_URL="jdbc:mysql://localhost:3306/personal_blog_db"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-db-password"
$env:GMAIL_EMAIL="your-email@gmail.com"
$env:GMAIL_PASSWORD="your-app-password"
$env:JWT_SECRET="replace-with-a-long-random-secret"
$env:JWT_EXPIRATION_MS="86400000"

# 3. Build and run
mvn clean install
mvn spring-boot:run
```

Access the application at: http://localhost:8080

## Features

### Authentication & Authorization
- User registration with email verification
- JWT-based login
- Role-based access control
- Secure password hashing with BCrypt

### Blog Management
- Create, read, update, delete blog posts
- Author-based access control
- Timestamped posts

### User-Friendly Interface
- Responsive design
- Clean, minimal UI
- Easy navigation
- Form validation

## Project Structure

```
personal-blog/
├── Backend (Spring Boot)
│   ├── Controllers - API endpoints
│   ├── Services - Business logic
│   ├── Repositories - Data access
│   ├── Entities - Database models
│   ├── Security - JWT & Spring Security
│   └── Configuration - Application setup
└── Frontend (HTML/CSS/JavaScript)
    ├── Static pages
    ├── CSS styling
    └── JavaScript API client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify?token=` - Verify email

### Blog Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/{id}` - Get single post
- `POST /api/posts` - Create post (authenticated)
- `PUT /api/posts/{id}` - Update post (authenticated)
- `DELETE /api/posts/{id}` - Delete post (authenticated)

## Configuration

Use environment variables for all secrets. Do not put passwords, API keys, or real JWT secrets in source files.

Required variables:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

Optional variables:
- `JWT_EXPIRATION_MS`
- `GMAIL_EMAIL`
- `GMAIL_PASSWORD`

### Generate a strong JWT secret

PowerShell:
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object {Get-Random -Maximum 256}))
```

## Push To GitHub Safely

Run these commands from the `personal-blog` folder:

```powershell
git init
git add .
git commit -m "Initial secure publish"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Before pushing, verify no secrets are staged:

```powershell
git status
git diff --cached
```

If a secret was committed by mistake, rotate it immediately (DB password, Gmail app password, JWT secret) and remove it from git history before sharing the repo.

## Security Considerations

- Passwords encrypted with BCrypt
- JWT tokens with 24-hour expiration
- Email verification required
- CORS properly configured
- Input validation on frontend and backend
- Centralized exception handling

## Technologies Used

- **Spring Boot 3.2.3** - Backend framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Data persistence
- **JWT (jjwt)** - Token-based authentication
- **MySQL** - Database
- **HTML5/CSS3** - Frontend markup & styling
- **Vanilla JavaScript** - Frontend interactivity

## License

MIT License

For deployment, keep production credentials in environment variables or your hosting platform's secret manager.
