# Yaswant Code LMS - PHP & SQL Backend

This folder contains the complete PHP backend and relational SQL database schema for **Yaswant Code**.

## Architecture Overview

```
backend/
├── schema.sql              # Full SQL schema (DDL & sample seed data)
├── config/
│   ├── Database.php        # PDO Singleton connection manager
│   └── cors.php            # JSON response & CORS middleware
└── api/
    ├── auth.php            # Student/Instructor registration & login with bcrypt
    ├── courses.php         # Course catalog, search, filter, and creation
    ├── enrollments.php     # Student enrollment & progress tracking
    └── certificates.php    # Credential issuance & cryptographic verification
```

## Setup Instructions

### 1. Database Provisioning
Import `schema.sql` into your MySQL/MariaDB server:
```bash
mysql -u root -p < schema.sql
```

### 2. Environment Configuration
Set the following environment variables in your server or `.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=yaswant_code_lms
DB_USER=root
DB_PASS=your_password
```

### 3. Run with PHP Built-in Server
To test the API endpoints locally:
```bash
cd backend
php -S 0.0.0.0:8000
```

### 4. Endpoints Summary
- `POST /api/auth.php?action=register` - Register a new user
- `POST /api/auth.php?action=login` - Login with credentials
- `GET /api/courses.php` - List all courses with category & search filters
- `GET /api/courses.php?id={id}` - Fetch single course details with modules & instructor
- `POST /api/courses.php` - Create a new course (Instructor/Admin)
- `GET /api/enrollments.php?user_id={id}` - Get user enrolled courses
- `POST /api/enrollments.php` - Enroll student into course
- `GET /api/certificates.php?code={verification_code}` - Verify certificate authenticity
