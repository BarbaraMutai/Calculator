// Front-end logic: read inputs, call the Flask API, show the result.
// Flow: first number -> operation -> second number. Calculates automatically.

const form = document.getElementById("calc-form");
const inputA = document.getElementById("a");
const inputB = document.getElementById("b");
const display = document.querySelector(".display");
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const opsEl = document.querySelector(".ops");
const buttons = document.querySelectorAll("[data-op]");

const HINT = "Enter a number, choose an operation, then enter a second number.";
// Symbols used to show the calculation, e.g. "6 × 7".
const SYMBOLS = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

let operation = null; // the currently chosen operation, or null
let requestId = 0; // lets us ignore slow responses that are already out of date

function showError(message, badInputs = []) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  display.classList.add("has-error");
  badInputs.forEach((input) => input.classList.add("invalid"));
}

function clearError() {
  errorEl.hidden = true;
  display.classList.remove("has-error");
  inputA.classList.remove("invalid");
  inputB.classList.remove("invalid");
}

function resetDisplay() {
  expressionEl.textContent = HINT;
  resultEl.textContent = "0";
}

// Round away floating-point noise (0.1 + 0.2) and keep long numbers readable.
function formatNumber(n) {
  return Number(n.toPrecision(12)).toLocaleString("en-US", {
    maximumFractionDigits: 10,
  });
}

// Runs whenever the first number, operation, or second number changes.
async function calculate() {
  clearError();
  const thisRequest = ++requestId;

  // A half-typed value such as "-" or "1e" counts as invalid input.
  const bad = [inputA, inputB].filter((i) => i.validity.badInput);
  if (bad.length) {
    resetDisplay();
    showError("Enter a valid number in both fields.", bad);
    return;
  }

  // Wait until all three parts are provided.
  if (!operation || inputA.value.trim() === "" || inputB.value.trim() === "") {
    resetDisplay();
    return;
  }

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: inputA.value, b: inputB.value, operation }),
    });
    const data = await response.json();
    if (thisRequest !== requestId) return; // a newer calculation replaced this one

    if (!response.ok) {
      resetDisplay();
      showError(data.error || "Something went wrong. Try again.");
      return;
    }

    expressionEl.textContent = `${formatNumber(data.a)} ${SYMBOLS[operation]} ${formatNumber(data.b)} =`;
    resultEl.textContent = formatNumber(data.result);
  } catch (err) {
    // Network failure or the server isn't running.
    if (thisRequest !== requestId) return;
    resetDisplay();
    showError("Cannot reach the server. Check that the app is running.");
  }
}

function setOperation(op) {
  operation = op;
  opsEl.classList.toggle("has-choice", op !== null);
  buttons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.op === op)),
  );
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    setOperation(button.dataset.op);
    calculate();
  });
});

// "input" fires on every keystroke, so the result updates as the numbers change.
inputA.addEventListener("input", calculate);
inputB.addEventListener("input", calculate);

// Prevent the page from reloading if Enter is pressed in a field.
form.addEventListener("submit", (e) => e.preventDefault());

document.getElementById("clear").addEventListener("click", () => {
  form.reset();
  setOperation(null);
  requestId++; // ignore any request still in flight
  clearError();
  resetDisplay();
  inputA.focus();
});
