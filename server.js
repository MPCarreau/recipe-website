const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();


const nodemailer = require("nodemailer");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const app = express();

app.use(express.static("."));
app.use("/static", express.static("static"));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// For password hashing and session management
const bcrypt = require("bcrypt");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "change-this-secret-key",
  resave: false,
  saveUninitialized: false
}));

/* REGISTER */
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash],
      (err, result) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: "Username or email already exists."
          });
        }

        res.json({ success: true, message: "Account created successfully." });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});


/* LOGIN */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username, username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error." });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      res.json({ success: true, message: "Login successful." });
    }
  );
});


/* CHECK AUTH */
app.get("/api/check-auth", (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});


/* LOGOUT */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully." });
  });
});










// API endpoint to get recipes by category slug
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

          console.error("Recipe category route error:", err);

          return res.status(500).json({
            error: "Database error",
            details: err.message
          });

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

// Authentication check endpoint for client-side use
app.get("/api/check-auth", (req, res) => {

  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }

});

// API endpoint to get user's favorite recipes
app.post("/api/favorites/:recipeId", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in."
    });
  }

  const userId = req.session.user.id;
  const recipeId = req.params.recipeId;

  db.query(
    "INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)",
    [userId, recipeId],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      res.json({
        success: true,
        message: "Recipe saved to favorites."
      });
    }
  );
});

// Display favorites on the favorites page
app.get("/api/favorites", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in."
    });
  }

  const userId = req.session.user.id;

  db.query(
    `
    SELECT recipes.*
    FROM favorites
    JOIN recipes
      ON favorites.recipe_id = recipes.id
    WHERE favorites.user_id = ?
    ORDER BY recipes.title ASC
    `,
    [userId],
    (err, recipes) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
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
              return res.status(500).json({ error: "Ingredient query error" });
            }

            recipe.ingredients = ingredients;

            db.query(
              "SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number",
              [recipe.id],
              (instructionErr, instructions) => {
                if (instructionErr) {
                  return res.status(500).json({ error: "Instruction query error" });
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

// Remove Favorites 
app.delete("/api/favorites/:recipeId", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in."
    });
  }

  const userId = req.session.user.id;
  const recipeId = req.params.recipeId;

  db.query(
    "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
    [userId, recipeId],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      res.json({
        success: true,
        message: "Recipe removed from favorites."
      });
    }
  );
});


// API endpoint to get all recipes for search suggestions
app.get("/api/all-recipes", (req, res) => {
  db.query(
    `
    SELECT 
      recipes.id,
      recipes.title,
      categories.slug AS category_slug
    FROM recipes
    JOIN categories
      ON recipes.category_id = categories.id
    ORDER BY recipes.title ASC
    `,
    (err, recipes) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json(recipes);
    }
  );
});



// FORGOT PASSWORD
const crypto = require("crypto");

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required."
    });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      // Don't reveal if email exists
      if (results.length === 0) {
        return res.json({
          success: true,
          message: "If that email exists, a reset link has been generated."
        });
      }

      const user = results[0];

      const token = crypto.randomBytes(32).toString("hex");

      const expires = new Date(Date.now() + 1000 * 60 * 60);

      db.query(
        `
        UPDATE users
        SET reset_token = ?, reset_token_expires = ?
        WHERE id = ?
        `,
        [token, expires, user.id],
        (updateErr) => {

          if (updateErr) {
            return res.status(500).json({
              success: false,
              message: "Database error."
            });
          }

            const resetLink = `https://aprecipes.up.railway.app/reset-password.html?token=${token}`;

                  transporter.sendMail(
                  {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Reset Your Recipe Website Password",
                    html: `
                      <h2>Password Reset</h2>
                      <p>Click the link below to reset your password:</p>
                      <a href="${resetLink}">${resetLink}</a>
                      <p>This link expires in 1 hour.</p>
                    `
                  },
                  (emailErr) => {
                    if (emailErr) {
                      console.error("Email error:", emailErr);

                      return res.status(500).json({
                        success: false,
                        message: "Could not send reset email."
                      });
                    }

                    res.json({
                      success: true,
                      message: "Password reset email sent."
                    });
                  }
                );
        }
      );
    }
  );
});


// RESET PASSWORD ENDPOINT
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Missing token or password."
    });
  }

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1",
    [token],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset link."
        });
      }

      const user = results[0];
      const passwordHash = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
        [passwordHash, user.id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              success: false,
              message: "Could not reset password."
            });
          }

          res.json({
            success: true,
            message: "Password reset successfully. You can now log in."
          });
        }
      );
    }
  );
});




app.listen(3000, () => {
  console.log("Server running at https://aprecipes.up.railway.app");
});


