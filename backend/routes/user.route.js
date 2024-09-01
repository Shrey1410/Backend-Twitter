const user_controller = require("../controllers/user.controller")
const auth_middleware = require("../middlewares/auth.middlewares")
module.exports = (app)=>{
    app.post("/profile/:username", [auth_middleware.verifyjwttoken], user_controller.getuserprofile)
    app.get("/suggested", [auth_middleware.verifyjwttoken], user_controller.getsuggesteduser)
    app.post("/follow/:id", [auth_middleware.verifyjwttoken], user_controller.followandunfollow)
    app.post("/updateprofile", [auth_middleware.verifyjwttoken], user_controller.updateprofile)
}