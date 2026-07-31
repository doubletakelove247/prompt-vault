// Grab the three elements from the page by their id, so we can use them in JS
const input = document.getElementById("prompt-input");
const addButton = document.getElementById("add-button");
const searchInput = document.getElementById("search-input");
const list = document.getElementById("prompt-list");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyButton = document.getElementById("save-key-button");
const keyStatus = document.getElementById("key-status");

const AI_MODEL = "claude-haiku-4-5-20251001";

// --- API key settings (key lives only in localStorage, never in code) ---

apiKeyInput.value = localStorage.getItem("anthropicApiKey") || "";
updateKeyStatus();

saveKeyButton.addEventListener("click", function () {
  localStorage.setItem("anthropicApiKey", apiKeyInput.value.trim());
  updateKeyStatus();
});

function updateKeyStatus() {
  keyStatus.textContent = localStorage.getItem("anthropicApiKey")
    ? "Key saved ✓"
    : "No key saved yet";
}

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

    const promptText = prompts[i];

    const item = document.createElement("li");
    item.textContent = promptText;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";

    // This function "remembers" the i it was created with (a closure),
    // so each button knows exactly which prompt is its own.
    deleteBtn.addEventListener("click", function () {
      prompts.splice(i, 1);
      savePrompts();
      renderList();
    });

    const runBtn = document.createElement("button");
    runBtn.textContent = "Run through AI";

    const responseBox = document.createElement("p");
    responseBox.className = "ai-response";

    runBtn.addEventListener("click", function () {
      runThroughAI(promptText, responseBox);
    });

    item.appendChild(deleteBtn);
    item.appendChild(runBtn);
    item.appendChild(responseBox);
    list.appendChild(item);
  }
}

// Sends a prompt to the Anthropic Messages API and shows the result in responseBox
async function runThroughAI(promptText, responseBox) {
  const apiKey = localStorage.getItem("anthropicApiKey");

  if (!apiKey) {
    responseBox.textContent = "Paste your Anthropic API key in the settings box above first.";
    return;
  }

  responseBox.textContent = "Thinking...";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: promptText }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      responseBox.textContent = "Error: " + (data.error ? data.error.message : response.statusText);
      return;
    }

    responseBox.textContent = data.content[0].text;
  } catch (err) {
    responseBox.textContent = "Something went wrong: " + err.message;
  }
}

searchInput.addEventListener("input", renderList);

renderList();
