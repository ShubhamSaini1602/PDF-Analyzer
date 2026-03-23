const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../Models/user");

const validateAdmin = async(req, res, next) => {
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
        // If I’m not an admin, I can’t register anyone as an admin,
        // because only an existing admin has the permission to register another admin.
        if(payload.role != "admin"){
            throw new Error("Invalid Token");
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

module.exports = validateAdmin;