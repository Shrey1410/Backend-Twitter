const notification_controller = require("../controllers/notifications.controller")
const auth_middleware = require("../middlewares/auth.middlewares")
module.exports = (app)=>{
    app.get("/getnotification", [auth_middleware.verifyjwttoken], notification_controller.getnotifications)
    app.delete("/deletenotification", [auth_middleware.verifyjwttoken], notification_controller.deletenotification)
}