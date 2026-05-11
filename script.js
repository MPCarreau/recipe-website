const recipes = [
  {
    title: "Chocolate Chip Cookies",
    category: "Cookies",
    prepTime: "15 minutes",
    bakeTime: "12 minutes"
  }
  ,
  {
    title: "Second Recipe",
    category: "Cookies",
    prepTime: "15 minutes",
    bakeTime: "12 minutes"
  }

];

const container = document.getElementById("recipe-container");

recipes.forEach(recipe => {
  container.innerHTML += `
    <div class="recipe-card">
      <h2>${recipe.title}</h2>
      <p>${recipe.category}</p>
      <p>Prep time: ${recipe.prepTime}</p>
      <p>Bake time: ${recipe.bakeTime}</p>
    </div>
  `;
});