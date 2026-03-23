const axios = require("axios");

const getLanguageByID = (lang) => {
    const language = {
        "c++": 105,
        "java": 96,
        "javascript": 102
    }

    return language[lang.toLowerCase()];
}

const submitBatch = async(submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
	    try {
            // Making a Call to Judge0's API
		    const response = await axios.request(options);
		    return response.data;
	    } 
        catch (error) {
		    console.error(error);
	    }
    }

    return await fetchData();
}   

const waiting = async(timer) =>{
    setTimeout(() => {
        return 1;
    },timer)
}
const submitTokens = async(arrayOfTokens) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: arrayOfTokens.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    async function fetchData() {
	    try {
		    const response = await axios.request(options);
		    return response.data;
	    }
        catch (error) {
		    console.error(error);
	    }
    }

    while(true){
        const result = await fetchData();
        // If any obj's status_id < 2, then this will return false and fetchData()
        // function will be called again after 1sec. We do this because a status_id 
        // of 1 or 2 means the data is either still in the queue or currently being 
        // processed. Therefore, we keep re-invoking fetchData() function until all 
        // data has been fully retrieved.
        const resultObtained = result.submissions.every((obj) => obj.status_id > 2);
        if(resultObtained===true){
            return result;
        }

        // Wait for 1sec before calling the fetchData() function again
        await waiting(1000);
    }
}

module.exports = {getLanguageByID, submitBatch, submitTokens};