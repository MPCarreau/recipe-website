const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(express.static("."));
app.use("/static", express.static("static"));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Connected to MySQL database");
});

app.get("/api/recipes/:categorySlug", (req, res) => {
  const categorySlug = req.params.categorySlug;

  db.query(
    `
    SELECT recipes.*
    FROM recipes
    JOIN categories
      ON recipes.category_id = categories.id
    WHERE categories.slug = ?
    ORDER BY recipes.title ASC
    `,
    [categorySlug],
    (err, recipes) => {
      if (err) {
        res.status(500).json({ error: "Database error" });
        return;
      }

      if (recipes.length === 0) {
        return res.json([]);
      }

      let completed = 0;

      recipes.forEach(recipe => {
        db.query(
          "SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY ingredient_order",
          [recipe.id],
          (ingredientErr, ingredients) => {
            if (ingredientErr) {
              res.status(500).json({ error: "Ingredient query error" });
              return;
            }

            recipe.ingredients = ingredients;

            db.query(
              "SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number",
              [recipe.id],
              (instructionErr, instructions) => {
                if (instructionErr) {
                  res.status(500).json({ error: "Instruction query error" });
                  return;
                }

                recipe.instructions = instructions;

                completed++;

                if (completed === recipes.length) {
                  res.json(recipes);
                }
              }
            );
          }
        );
      });
    }
  );
});

app.get("/api/check-auth", (req, res) => {

  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }

});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});