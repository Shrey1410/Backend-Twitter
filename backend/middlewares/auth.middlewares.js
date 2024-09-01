const user_model = require("../models/user.model")
const jwt_config = require("../../config/jwt.config")
const jwt = require("jsonwebtoken")

exports.verifyjwttoken = async (req, res, next)=>{
    try{
        const token = req.cookies.jwt
        if(!token){
            return res.status(400).json({
                message : "token not found"
            })
        }
        const decoded = jwt.verify(token, jwt_config.JWT_SECRETE)
        if(!decoded){
            return res.status(400).json({
                message : "Invalid token"
            })
        }
        const user = await user_model.findById(decoded._id)
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }
        req.user= user
        next()
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            message : "Internal Server error"
        })
    }
}