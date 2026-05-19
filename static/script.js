function formatQuantity(number) {
  if (number === null || number === undefined || isNaN(number)) {
    return "";
  }

  const tolerance = 0.03;

  const fractions = [
    { value: 1 / 4, text: "1/4" },
    { value: 1 / 3, text: "1/3" },
    { value: 1 / 2, text: "1/2" },
    { value: 2 / 3, text: "2/3" },
    { value: 3 / 4, text: "3/4" }
  ];

  const roundedWhole = Math.round(number);

  if (Math.abs(number - roundedWhole) < tolerance) {
    return roundedWhole.toString();
  }

  const whole = Math.floor(number);
  const decimal = number - whole;

  for (const fraction of fractions) {
    if (Math.abs(decimal - fraction.value) < tolerance) {
      if (whole === 0) {
        return fraction.text;
      }

      return `${whole} ${fraction.text}`;
    }
  }

  const rounded = Math.round(number * 100) / 100;

  return Number.isInteger(rounded)
    ? rounded.toString()
    : rounded.toString();
}



   // LOAD NAVBAR


fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    const navbarContainer = document.getElementById("navbar-container");

    if (!navbarContainer) return;

    navbarContainer.innerHTML = data;

    loadNavbarAuth();
  })
  .catch(error => {
    console.error("Error loading navbar:", error);
  });



  // LOGIN and LOGOUT NAVBAR


async function loadNavbarAuth() {
  const navAuth = document.getElementById("nav-auth");

  if (!navAuth) return;

  try {
    const response = await fetch("/api/check-auth");
    const data = await response.json();

    if (data.loggedIn) {
      navAuth.innerHTML = `
        <a href="#" id="logout-button">Logout</a>
      `;

      document
        .getElementById("logout-button")
        .addEventListener("click", logoutUser);

    } else {
      navAuth.innerHTML = `
        <a href="login.html">Login</a>
      `;
    }

  } catch (error) {
    console.error("Auth check failed:", error);
  }
}


async function logoutUser(event) {
  event.preventDefault();

  try {
    await fetch("/api/logout", {
      method: "POST"
    });

    window.location.href = "login.html";

  } catch (error) {
    console.error("Logout failed:", error);
  }
}



  // LOAD RECIPES BY CATEGORY


const category = document.body.dataset.category;
const container = document.getElementById("recipe-container");

if (category && container) {
  fetch(`/api/recipes/${category}`)
    .then(response => response.json())
    .then(recipes => {
      container.innerHTML = "";

      recipes.forEach(recipe => {
         let ingredientsHTML = "";
        let instructionsHTML = "";

        const imageUrl = recipe.image_url;

        // Sort ingredients so that required ones come first (optional ones at the end)
        const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
          return Number(a.optional) - Number(b.optional);
        });

        let currentSection = "";

          sortedIngredients.forEach(ingredient => {

            const section = ingredient.section || "";

            if (section !== currentSection) {

              if (currentSection !== "") {
                ingredientsHTML += `</ul>`;
              }

              if (section !== "") {
                ingredientsHTML += `<h4 class="ingredient-section">${section}</h4>`;
              }

              ingredientsHTML += `<ul>`;

              currentSection = section;
            }

            ingredientsHTML += `
              <li>
                <span 
                  class="ingredient-quantity"
                  data-recipe-id="${recipe.id}"
                  data-base-quantity="${ingredient.quantity}"
                >
                  ${ingredient.quantity_text || ""}
                </span>
                ${ingredient.unit || ""}
                ${ingredient.name}
                ${Number(ingredient.optional) === 1 ? "(optional)" : ""}
              </li>
            `;
          });

          if (sortedIngredients.length > 0) {
            ingredientsHTML += `</ul>`;
          }

        recipe.instructions.forEach(instruction => {
          instructionsHTML += `
            <li>${instruction.instruction}</li>
          `;
        });

        container.innerHTML += `
          <div class="recipe-card" id="recipe-card-${recipe.id}">
            <div class="recipe-content">

              <div class="recipe-left">
                <h2>${recipe.title}</h2>
                <button class="favorite-button" onclick="saveFavorite(${recipe.id})">
                  Save to Favorites
                </button>

                <button class="print-button" onclick="printRecipe(${recipe.id})">
                  Print Recipe
                </button>

                ${recipe.servings ? `<p><strong>Servings:</strong> ${recipe.servings}</p>` : ""}
                ${recipe.oven_temp_f ? `<p><strong>Oven:</strong> ${recipe.oven_temp_f}°F</p>` : ""}
                ${recipe.bake_time ? `<p><strong>Bake time:</strong> ${recipe.bake_time}</p>` : ""}
                ${recipe.pan_size ? `<p><strong>Pan:</strong> ${recipe.pan_size}</p>` : ""}

                <h3>Instructions</h3>
                <ol>
                  ${instructionsHTML}
                </ol>

                ${recipe.notes ? `
                  <p>
                    <strong>Notes:</strong><br>
                    ${recipe.notes.replace(/\.\s/g, ".<br>")}
                  </p>
                ` : ""}
              </div>

              <div class="recipe-middle">

                <br>

                <div class="serving-buttons">
                  <button onclick="updateIngredients(${recipe.id}, 1)">1x</button>
                  <button onclick="updateIngredients(${recipe.id}, 2)">2x</button>
                  <button onclick="updateIngredients(${recipe.id}, 3)">3x</button>
                </div>

                <h3>Ingredients</h3>
                  ${ingredientsHTML}
              </div>

              <div class="recipe-image">
                <img 
                  src="${imageUrl}"
                  alt="${recipe.title}"
                >
              </div>

            </div>
          </div>
        `;
      });


          const searchInput = document.getElementById("recipe-search");

          if (searchInput) {
            searchInput.addEventListener("input", function () {
              const searchTerm = searchInput.value.toLowerCase();

              const recipeCards = document.querySelectorAll(".recipe-card");

              recipeCards.forEach(card => {
                const title = card.querySelector("h2").textContent.toLowerCase();

                if (title.includes(searchTerm)) {
                  card.style.display = "block";
                } else {
                  card.style.display = "none";
                }
              });
            });
          }

                const suggestionList = document.getElementById("recipe-suggestions");

                if (suggestionList) {
                  suggestionList.innerHTML = "";

                  recipes.forEach(recipe => {
                    suggestionList.innerHTML += `
                      <option value="${recipe.title}">
                    `;
                  });
}

      const hash = window.location.hash;

        if (hash) {

          setTimeout(() => {

            const target =
              document.querySelector(hash);

            if (target) {

              const navbarOffset = 120;

              const targetPosition =
                target.getBoundingClientRect().top + window.scrollY - navbarOffset;

              window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
              });

            }

          }, 100);

        }

    })
    .catch(error => {
      console.error("Error fetching recipes:", error);
    });
}


// HOME PAGE SEARCH
const homeSearch = document.getElementById("home-search");
const homeSearchResults = document.getElementById("home-search-results");

if (homeSearch && homeSearchResults) {
  fetch("/api/all-recipes")
    .then(response => response.json())
    .then(recipes => {
      homeSearch.addEventListener("input", () => {
        const searchTerm = homeSearch.value.toLowerCase().trim();

        homeSearchResults.innerHTML = "";

        if (searchTerm === "") return;

        const matches = recipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchTerm)
        );

        matches.forEach(recipe => {
          homeSearchResults.innerHTML += `
            <div 
              class="home-search-result"
              onclick="window.location.href='${recipe.category_slug}.html#recipe-card-${recipe.id}'"
            >
              ${recipe.title}
            </div>
          `;
        });
      });
    });
}


// SERVING MULTIPLIER

function updateIngredients(recipeId, multiplier) {
  const quantities = document.querySelectorAll(
    `.ingredient-quantity[data-recipe-id="${recipeId}"]`
  );

  quantities.forEach(quantitySpan => {
    const baseQuantity = parseFloat(quantitySpan.dataset.baseQuantity);

    if (isNaN(baseQuantity)) {
      quantitySpan.textContent = "";
      return;
    }

    quantitySpan.textContent = formatQuantity(baseQuantity * multiplier);
  });
}

// FAVORITES
async function saveFavorite(recipeId) {
  try {
    const response = await fetch(`/api/favorites/${recipeId}`, {
      method: "POST"
    });

    const data = await response.json();

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    showPopup(data.message);

  } catch (error) {
    console.error("Favorite error:", error);
  }
}

// Custom Alert Popup
function showPopup(message) {

    const popup = document.createElement("div");

    popup.classList.add("popup-message");

    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button onclick="closePopup()">OK</button>
        </div>
    `;

    document.body.appendChild(popup);
}

function closePopup() {

    const popup = document.querySelector(".popup-message");

    if (popup) {
        popup.remove();
    }

}
// PRINT RECIPE
let recipeToPrintId = null;

function printRecipe(recipeId) {
  recipeToPrintId = recipeId;

  document.body.classList.add("printing-recipe");

  const recipeCard = document.getElementById(`recipe-card-${recipeId}`);

  if (recipeCard) {
    recipeCard.classList.add("selected-print-recipe");
  }

  window.print();

  document.body.classList.remove("printing-recipe");

  if (recipeCard) {
    recipeCard.classList.remove("selected-print-recipe");
  }

  recipeToPrintId = null;
}

