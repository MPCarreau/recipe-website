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

  // makes 0.99 -> 1, 1.99 -> 2, etc.
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


fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar-container").innerHTML = data;
  });

  /*
if (userLoggedIn) {
    navAuth.innerHTML = `
        <a href="#" id="logout-button">Logout</a>
    `;
} else {
    navAuth.innerHTML = `
        <a href="login.html">Login</a>
    `;
}
  */


const category = document.body.dataset.category;

fetch(`/api/recipes/${category}`)
  .then(response => response.json())
  .then(recipes => {
    const container = document.getElementById("recipe-container");

    container.innerHTML = "";

    recipes.forEach(recipe => {
      let ingredientsHTML = "";
      let instructionsHTML = "";

        recipe.ingredients.forEach(ingredient => {
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
              ${ingredient.optional ? "(optional)" : ""}
            </li>
          `;
        });

      recipe.instructions.forEach(instruction => {
        instructionsHTML += `
          <li>${instruction.instruction}</li>
        `;
      });

      container.innerHTML += `
        <div class="recipe-card">
          <div class="recipe-content">

            <div class="recipe-left">
              <h2>${recipe.title}</h2>

              <p>${recipe.description || ""}</p>

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

                <br></br>
              <div class="serving-buttons">
                <button onclick="updateIngredients(${recipe.id}, 1)">1x</button>
                <button onclick="updateIngredients(${recipe.id}, 2)">2x</button>
                <button onclick="updateIngredients(${recipe.id}, 3)">3x</button>
              </div>

              <h3>Ingredients</h3>
              <ul>
                ${ingredientsHTML}
              </ul>
            </div>

            <div class="recipe-image">
              <img 
                src="${recipe.image_url}" 
                alt="${recipe.title}"
              >
            </div>

          </div>
        </div>
      `;
    });
  })
  .catch(error => {
    console.error("Error fetching recipes:", error);
  });

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