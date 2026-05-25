# AP Family Recipes

A full-stack recipe management web application built with Node.js, Express, MySQL, and JavaScript.

Live at aprecipes.up.railway.app
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

## API Endpoints

### Authentication

- `POST /api/register` — User registration
- `POST /api/login` — User login
- `POST /api/logout` — User logout
- `POST /api/forgot-password` — Password reset request
- `POST /api/reset-password` — Reset password
- `GET /api/check-auth` — Check authentication status

---

### Recipes

- `GET /api/recipes/:category` — Get recipes by category
- `GET /api/recipe/:id` — Get single recipe
- `GET /api/search` — Search recipes

---

### Favorites

- `POST /api/favorites/add` — Add recipe to favorites
- `DELETE /api/favorites/remove/:id` — Remove recipe from favorites
- `GET /api/favorites` — Get user's favorite recipes

---

### Users

- `GET /api/user-profile` — Get user profile
- `PUT /api/update-profile` — Update user profile

---

## Deployment

The application is deployed using:

- Railway (Node.js hosting)
- Railway MySQL database
- GitHub version control

---

## Screenshots

(Add screenshots here)


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
