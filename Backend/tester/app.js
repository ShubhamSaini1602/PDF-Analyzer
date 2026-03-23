// [CodeGuardian Fix] Removed hardcoded API key for security. Use environment variables.
const API_KEY = "YOUR_API_KEY_HERE";

function getUserName(user) {
    // [CodeGuardian Fix] Added null/undefined checks for 'user' and 'user.name' to prevent errors.
    if (!user || !user.name) {
        return "UNKNOWN";
    }
    return user.name.toUpperCase();
}

// [CodeGuardian Fix] Removed console.log statements as they are typically not needed in production.
// console.log("App started");

function runCode(code) {
    // [CodeGuardian Fix] Removed eval() due to severe security risks (e.g., arbitrary code execution, XSS).
    // Consider alternative, safer methods for dynamic code execution or re-evaluate necessity.
    // eval(code);
    console.error("Attempted to run code using eval(). This is a security risk and has been blocked.");
}

async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
}

// [CodeGuardian Fix] Removed unused variable to clean up the codebase.
// const unusedVar = "I'm never used";

function calculateTotal(a, b) {
    // [CodeGuardian Fix] Added return statement for the calculated sum, as the function previously did not return a value.
    const sum = a + b;
    return sum;
}

function displayMessage(userInput) {
    // [CodeGuardian Fix] Changed innerHTML to textContent to prevent Cross-Site Scripting (XSS) vulnerabilities.
    document.getElementById('message').textContent = userInput;
}

function compare(a, b) {
    // [CodeGuardian Fix] Changed '==' to '===' for strict equality comparison, preventing type coercion issues.
    if (a === b) {
        return true;
    }
    return false;
}

async function getData() {
    // [CodeGuardian Fix] Added 'await' to ensure fetchData completes before logging "Done", preventing a floating promise.
    await fetchData();
    // [CodeGuardian Fix] Removed console.log statements as they are typically not needed in production.
    // console.log("Done");
}

function generateToken() {
    return Math.random().toString(36);
}