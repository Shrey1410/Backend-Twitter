const mongoose = require("mongoose")

const post_schema = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text : {
        type : String
    },
    image : {
        type : String
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    comments : [
        {
            text : {
                type : String,
                required : true
            },
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User",
                required : true
            }
        }
    ]
}, {timestamps : true, versionKey : false})

module.exports = mongoose.model("Post", post_schema)