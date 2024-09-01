const post_model = require("../models/post.model")
const user_model = require("../models/user.model")
const cloudinary = require("cloudinary").v2
const notification = require("../models/notification.model")

exports.createposts = async (req, res)=>{
    try{
        const {text} = req.body
        let {img} = req.body
        const userid = req.user._id;
        const currentuser = await user_model.findById(userid)
        if(!currentuser){
            return res.status(400).json({
                message : "user does not exits"
            })
        }
        if(!text && !img){
            return res.status(400).json({
                message : "Posts must have text or image"
            })
        }
        if(img){
            const uploaded = await cloudinary.uploader.upload(img)
            img = uploaded.secure_url
        }
        const post = await post_model.create({
            user : userid,
            text : text,
            img : img
        })
        if(!post){
            return res.status(400).json({
                message : "Error while creating posts"
            })
        }
        return res.status(200).json(post)
    }catch(error){
        console.log(error)
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}

exports.deleteposts = async (req, res)=>{
    try{
        const {id} = req.params
        const post = await post_model.findById(id)
        if(!post){
            return res.status(400).json({
                message : "post not found"
            })
        }
        if(!post.user.equals(req.user._id)){
            return res.status(400).json({
                message : "You cannot delete this post"
            })
        }
        if(post.img){
            let imgid = post.img.split("/")
            imgid = imgid[imgid.length-1].split('.')[0]
            await cloudinary.uploader.destroy(imgid);
        }
        await post_model.findByIdAndDelete(id)
        return res.status(200).json({
            message : "Successfully deleted the post"
        })
    }
    catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}

exports.likeandunlike =async (req, res)=>{
    try{
        const currentuser = req.user._id
        const {id} = req.params

        const post = await post_model.findById(id)
        if(!post){
            return res.status(400).json({
                message : "post not found"
            })
        }
        const userLikedpost = post.likes.includes(currentuser)

        if(userLikedpost){
            await post_model.updateOne({_id : id}, {$pull: {likes : currentuser}})
            await user_model.updateOne({_id : currentuser}, {$pull : {likedPosts : id}})
            res.status(200).json({
                message : "Post unliked successfully"
            })
        }
        else{
            post.likes.push(currentuser);
            await user_model.updateOne({_id : currentuser}, {$push : {likedPosts : id}})
            await post.save()
            const notify = await notification.create({
                from : currentuser,
                to : post.user,
                type : "like"
            })
            return res.status(200).json({
                message : "Posts liked successfully"
            })
        }
    }
    catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}

exports.comment = async (req, res)=>{
    try{
        const {text} = req.body
        const {id} = req.params
        const currentuser = req.user._id
        if(!text){
            return res.status(400).json({
                message : "Comment is empty"
            })
        }
        const post = await post_model.findById(id)
        if(!post){
            return res.status().send({
                message : "Error posts not found"
            })
        }
        const comment = {user : currentuser, text : text}
        post.comments.push(comment)
        await post.save()
        return res.status(200).send({
            message : "Successfully created comment"
        })
    }catch(error){
        console.log("Internal Server Error")
    }
}

exports.getallposts = async (req, res)=>{
    try{
        const posts = await post_model.find().sort({createdAt : -1}).populate({
            path : "user",
            select  : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })

        if(posts.length==0){
            return res.status(200).json([])
        }

        res.status(200).json(posts)
    }
    catch(error){
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}

exports.getlikedposts = async (req, res)=>{
    const {id} = req.params
    try{
        const user = await user_model.findById(id)
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }
        const likedposts = await post_model.find({_id : {$in : user.likedPosts}}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })
        return res.status(200).json(likedposts)
    }
    catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Error in getting liked posts"
        })
    }
}

exports.following  = async (req, res)=>{
    try{
        const userid = req.user._id
        const user = await user_model.findById(userid)
        console.log(userid)
        if(!user){
            return res.status(400).json({
                message : "User not found"
            })
        }
        const following = user.following
        const feedposts = await post_model.find({user : {$in : following}}).sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })
        return res.status(200).json(feedposts)
    }
    catch(error){
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}

exports.getuserposts = async (req, res)=>{
    try{
        const {username} = req.params
        const user = await user_model.findOne({username : username})
        if(!user){
            return res.status(400).json({
                message : "user not found"
            })
        }

        const posts = await post_model.find({user : user._id}).sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })
        return res.status(200).json(posts)
    }
    catch(error){
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}