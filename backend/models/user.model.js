const mongoose = require("mongoose")

const user_schema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    fullname : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
        minLength : 8
    },
    email: {
        type : String,
        required : true,
        minLength : 8
    },
    followers : [
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : []
        }
    ],
    following : [
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : []
        }
    ],
    profileimg : {
        type : String,
        default : ""
    },
    coverimg : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    link : {
        type : String,
        default : ""
    },
    likedPosts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Post",
            default : []
        }
    ]
},{timestamps : true, versionKey: false})

module.exports = mongoose.model("User", user_schema)