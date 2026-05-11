fetch("/api/recipes")
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
            ${ingredient.quantity_text || ""}
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