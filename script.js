// Grab the three elements from the page by their id, so we can use them in JS
const input = document.getElementById("prompt-input");
const addButton = document.getElementById("add-button");
const searchInput = document.getElementById("search-input");
const list = document.getElementById("prompt-list");

// Our "state": the list of prompts, loaded from localStorage so it survives a refresh
let prompts = JSON.parse(localStorage.getItem("prompts")) || [];

// Saves the current prompts array to localStorage
function savePrompts() {
  localStorage.setItem("prompts", JSON.stringify(prompts));
}

// Listen for clicks on the button, and run this function each time
addButton.addEventListener("click", function () {
  const promptText = input.value;

  if (promptText === "") {
    return;
  }

  prompts.push(promptText);
  input.value = "";
  savePrompts();
  renderList();
});

// Rebuilds the <ul> on the page to match the current "prompts" array,
// filtered by whatever's typed in the search box
function renderList() {
  list.innerHTML = "";

  const query = searchInput.value.toLowerCase();

  for (let i = 0; i < prompts.length; i++) {
    if (!prompts[i].toLowerCase().includes(query)) {
      continue;
    }

    const item = document.createElement("li");
    item.textContent = prompts[i];

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";

    // This function "remembers" the i it was created with (a closure),
    // so each button knows exactly which prompt is its own.
    deleteBtn.addEventListener("click", function () {
      prompts.splice(i, 1);
      savePrompts();
      renderList();
    });

    item.appendChild(deleteBtn);
    list.appendChild(item);
  }
}

searchInput.addEventListener("input", renderList);

renderList();
