# AP Family Recipes

A full-stack recipe management web application built with Node.js, Express, MySQL, and JavaScript.

## Features

- Dynamic recipe rendering from MySQL database
- Categorized recipes
- Live recipe search
- User authentication system
- Save-to-favorites functionality
- Password reset workflow
- Ingredient section grouping
- Responsive frontend layout
- Railway deployment with MySQL database

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL
- MySQL Workbench

### Deployment
- Railway
- GitHub

---

## Database Tables

- recipes
- ingredients
- instructions
- categories
- favorites
- users

---

## Authentication Features

- User registration/login
- Session handling
- Password reset tokens
- Email recovery flow

---

## Local Setup

```bash
git clone <repo-url>

npm install

npm run dev
```

Create a `.env` file:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

SENDGRID_API_KEY=
EMAIL_FROM=
SESSION_SECRET=
```

---

## Future Improvements

- Admin dashboard
- Recipe and image uploads
- Mobile optimization
- Recipe ratings/comments

---

## Author

Built by Micah Carreau  
Montreal, Canada