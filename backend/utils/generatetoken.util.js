const jwt = require("jsonwebtoken")
const jwt_config = require("../../config/jwt.config")
exports.generate_token_and_set_cookie = (user_id , res)=>{
    const token = jwt.sign({_id : user_id}, jwt_config.JWT_SECRETE,{
        expiresIn : '10d'
    })
    res.cookie("jwt", token, {
        maxAge : 10*24*60*60*1000,
        httpOnly : true, // prevent XSS attacks cross site scripting attacks 
        sameSite : "strict", // CSRF attacks cross-site request forgery attacks 
        secure : true
    })
}