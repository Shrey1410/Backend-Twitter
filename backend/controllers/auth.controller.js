const user_model = require("../models/user.model")
const bcrypt = require("bcryptjs")
const generate_token_and_set_cookie = require("../utils/generatetoken.util").generate_token_and_set_cookie

exports.signup = async (req, res)=>{
    const {fullname , username , password , email} = req.body
    if(!fullname){
        return res.status(400).json({
            message : "fullName not present"
        })
    }
    if(!username){
        return res.status(400).json({
            message : "username not present"
        })
    }
    if(!password){
        return res.status(400).json({
            message : "password not present"
        })
    }
    if(!email){
        return res.status(400).json({
            message : "email not present"
        })
    }
    const email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if(!email_regex.test(email)){
        return res.status(400).json({
            message : "Invalid email id"
        })
    }
    if(password.length<8){
        return res.status(400).json({
            message : "Password Length is less than 8"
        })
    }
    const existing_user1 = await user_model.findOne({username : username})
    if(existing_user1){
        return res.status(400).json({
            message : "Username is already taken"
        })
    }
    const existing_user2 = await user_model.findOne({email: email})
    if(existing_user2){
        return res.status(400).json({
            message : "Email is already taken"
        })
    }
    const user = await user_model.create({
        username : username,
        password : bcrypt.hashSync(password, 10),
        fullname : fullname,
        email : email
    })
    if(!user){
        return res.status(500).json({
            message : "Error while creating new user"
        })
    }
    generate_token_and_set_cookie(user._id, res)
    return res.status(200).json([{
        message : "User created successfully"
    }, {
        username : user.username,
        email : user.email,
        fullname : user.fullname,
        coverimg : user.coverimg,
        profileimg : user.profileimg,
        bio : user.bio,
        link : user.link
    }])
}

exports.login = async (req, res)=>{
    const {username, password} = req.body
    if(!username){
        return res.status().send({
            message : "username is not provided"
        })
    }
    if(!password){
        return res.status().send({
            message : "password is not provided"
        })
    }
    const user = await user_model.findOne({username : username})
    if(!user){
        return res.status(400).send({
            message : "username is not valid"
        })
    }
    if(!bcrypt.compareSync(password, user.password)){
        return res.status(400).json({
            message : "password is not valid"
        })
    }
    generate_token_and_set_cookie(user._id, res)
    return res.status(200).json({
        _id : user._id,
        username : user.username,
        email : user.email,
        fullname : user.fullname,
        coverimg : user.coverimg,
        profileimg : user.profileimg,
        bio : user.bio,
        link : user.link
    })
}

exports.logout = (req, res)=>{
    return res.cookie("jwt", "", {maxAge : 0}).status(200).json({
        message : "logged out successfully"
    })
}

exports.getMe = async (req, res)=>{
    try{
        const user = await user_model.findById(req.user._id).select("-password")
        return res.status(200).json(user);
    }catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Internal server Eror"
        })
    }
}