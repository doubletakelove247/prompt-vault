// Grab the three elements from the page by their id, so we can use them in JS
const input = document.getElementById("prompt-input");
const addButton = document.getElementById("add-button");
const list = document.getElementById("prompt-list");

// Our "state": the list of prompts, kept in memory as a plain array
let prompts = [];

// Listen for clicks on the button, and run this function each time
addButton.addEventListener("click", function () {
  const promptText = input.value;

  if (promptText === "") {
    return;
  }

  prompts.push(promptText);
  input.value = "";
  renderList();
});

// Rebuilds the <ul> on the page to match the current "prompts" array
function renderList() {
  list.innerHTML = "";

  for (let i = 0; i < prompts.length; i++) {
    const item = document.createElement("li");
    item.textContent = prompts[i];
    list.appendChild(item);
  }
}
