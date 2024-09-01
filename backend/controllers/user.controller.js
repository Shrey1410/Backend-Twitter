const user_model = require("../models/user.model")
const mongoose = require("mongoose")
const notification_schema = require("../models/notification.model")
const bcrypt = require("bcryptjs")
const cloudinary = require("cloudinary").v2

exports.getuserprofile = async (req, res)=>{
    const {username} = req.params;
    try{
        const user = await user_model.findOne({username : username}).select("-password")
        if(!user){
            return res.status(400).json({
                message : "User not found"
            })
        }
        res.status(200).json(user)
    }
    catch(error){
        console.log(error)
        return res.status(404).send({
            message : "Internal server error"
        })
    }
}

exports.followandunfollow = async (req, res)=>{
    try{
        const {id} = req.params
        if(!id){
            return res.status(400).json({
                message : "Error while sending"
            })
        }
        const usertomodify = await user_model.findById(id);
        const currentuser = await user_model.findById(req.user._id);
        if(usertomodify._id.equals(currentuser._id)){
            return res.status(400).json({
                message : "You cannot follow or unfollow yourself"
            })
        }
        if(!usertomodify || !currentuser){
            return res.status(400).json({
                message : "user not found"
            })
        }
        const isfollowing = currentuser.following.includes(id)
        if(isfollowing){
            await user_model.findByIdAndUpdate(id, {$pull : {
                followers : req.user._id
            }})
            await user_model.findByIdAndUpdate(req.user._id, {$pull : {
                following : id
            }})

            
            // to do return id of the user as a response
            return res.status(200).json({
                message : "Unfollow the user successfully"
            })
        }
        else{
            await user_model.findByIdAndUpdate(id, {$push : {
                followers : req.user._id
            }})
            await user_model.findByIdAndUpdate(req.user._id, {$push : {
                following : id
            }})
            const notification = await notification_schema.create({
                type : "follow",
                from : req.user._id,
                to : usertomodify._id
            })

            // to do return id of the user as a response
            return res.status(200).json({
                message : "followed the user successfully"
            })
        }
    }
    catch(error){
        console.log(error)
        return res.status(404).send({
            message : "Error in toggling follow"
        })
    }
}

exports.getsuggesteduser = async (req, res)=>{
    try{
        const userid = req.user._id
        const userfollowedbyme = await user_model.findById(userid).select("following")

        const users = await user_model.aggregate([
            {
                $match : {
                    _id : {$ne : userid}
                }
            },
            {
                $sample : {size : 10}
            }
        ])

        const filteredUsers = users.filter(user=>(!userfollowedbyme.following.includes(user._id)))
        const suggestedusers = filteredUsers.slice(0, 4)
        suggestedusers.forEach(user => (user.password = null))
        return res.status(200).json(suggestedusers)
    }catch(error){
        return res.status(404).json({
            message : "Internal server error"
        })
    }
}

exports.updateprofile = async (req, res)=>{
    const {fullname , email, username, currentpassword, newpassword, bio, link} = req.body
    let {profileimg, coverimg} = req.body

    const userid = req.user._id;
    try{
        const user =await user_model.findById(userid)
        if(!user){
            return res.status(400).json({
                message: "user not found"
            })
        }

        if(((!newpassword) && (currentpassword)) || ((newpassword) && (!currentpassword))){
            return res.status(400).json({
                message : "Please provide both new and current password"
            })
        }

        if(currentpassword && newpassword){
            const ismatch = bcrypt.compareSync(currentpassword, user.password)
            if(!ismatch){
                return res.status(400).json({
                    message : "current password not matched"
                })
            }
            if(newpassword.length < 8){
                return res.status(400).json({
                    message : "password must be of length 8"
                })
            }
            user.password = await bcrypt.hashSync(newpassword, 10)
        }

        if(profileimg){
            if(user.profileimg){
                const id = user.profile_img.split("/")
                id = id[id.length-1]
                id = id.split(".")[0]
                console.log(id)
                await cloudinary.uploader.destroy(id)
            }
            const profile_img  = await cloudinary.uploader.upload(profileimg)
            profileimg = profile_img.secure_url
        }

        if(coverimg){
            if(user.coverimg){
                const id = user.coverimg.split("/")
                id = id[id.length-1]
                id = id.split(".")[0]
                console.log(id)
                await cloudinary.uploader.destroy(id)
            }
            const cover_img  = await cloudinary.uploader.upload(coverimg)
            coverimg = cover_img.secure_url
        }
        user.fullname = fullname || user.fullname
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.username = username || user.username
        user.profileimg = profileimg || user.profileimg
        user.coverimg = coverimg || user.coverimg

        const updateduser = await user.save()
        user.password = null
        return res.status(200).json([{
            message : "Successfully updated the profile!!"
        }, updateduser])
    }
    catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Error in server"
        })
    }
}