const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../Models/user");

const validateToken = async(req, res, next) => {
    try{
        const { token } = req.cookies;
        if(!token){
            throw new Error("Token Doesn't Exist");
        }
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        // Redis BlackList Functionality
        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked){
            throw new Error("Invalid Token");
        }
        // --------------------

        const { _id } = payload;
        if(!_id){
            throw new Error("Id is Missing");
        }
        const result = await User.findById(_id);
        if(!result){
            throw new Error("User Doesn't Exist");
        }
        req.result = result;

        next();
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
}

module.exports = validateToken;
