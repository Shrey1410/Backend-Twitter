const notification_model = require("../models/notification.model")
const mongoose = require("mongoose")
exports.getnotifications = async (req, res)=>{
    try{
        const userid = req.user._id
        console.log(userid)
        const notification = await notification_model.find({to : userid}).populate({
            path : "from",
            select : "username.profileimg"
        })
        await notification_model.updateMany({to : userid}, {read : true})
        return res.status(200).json(notification)
    }
    catch(error){
        console.log(error)
        return res.status(404).json({
            message : "Error while fetching notification"
        })
    }
}

exports.deletenotification = async (req, res)=>{
    try{
        const userid = req.user._id;
        const notification = await notification_model.deleteMany({to : userid})
        return res.status(200).json({
            message : "Successfully deleted the notifications"
        })
    }
    catch(error){
        return res.status(404).json({
            message : "Error while fetching notification"
        })
    }
}