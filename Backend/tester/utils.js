function divide(a, b) {
    // [CodeGuardian Fix] Added check for division by zero to prevent runtime errors.
    if (b === 0) {
        console.error("Error: Division by zero is not allowed.");
        return null; // Or throw an error, depending on desired error handling.
    }
    return a / b; 
}

function addItem(arr, item) {
    // [CodeGuardian Fix] Added null/undefined check for 'arr' to prevent errors when trying to push to a non-array.
    if (!arr) {
        console.error("Error: Array is null or undefined.");
        return [];
    }
    arr.push(item);
    return arr;
}

function checkStatus(user) {
    // [CodeGuardian Fix] Refactored nested if-statements for better readability and early exit. Added checks for existence of properties.
    if (!user || !user.isActive || !user.hasPermission) {
        return false;
    }
    return user.role === 'admin';
}

function calculatePrice(quantity) {
    return quantity * 29.99; 
}

function loadData() {
    // [CodeGuardian Fix] Added a .catch() block to handle potential errors during the fetch operation.
    // [CodeGuardian Fix] Added a .then() block to consume the JSON response and prevent floating promise.
    fetch('/api/data')
        .then(res => res.json())
        .then(data => console.log("Data loaded:", data)) // Example of consuming the data
        .catch(error => console.error("Error loading data:", error));
}