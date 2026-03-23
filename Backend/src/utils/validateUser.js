const validator = require("validator");

function validateUser(data){
    const mandatoryFields = ["firstName", "emailId", "password"];
    const isPresent = mandatoryFields.every((field) => Object.keys(data).includes(field));

    if(!isPresent){
        throw new Error("Some fields are missing!");
    }

    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error("Weak Password");
    }

    if(!(data.firstName.length>=3 && data.firstName.length<=20)){
        throw new Error("First Name should have at least 3 chars and atmost 20 chars");
    }
}

module.exports = validateUser;