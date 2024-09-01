const auth_controllers = require("../controllers/auth.controller")
const auth_middleware = require("../middlewares/auth.middlewares")
module.exports = (app)=>{
    app.post("/signup", [], auth_controllers.signup)
    app.post("/login", [], auth_controllers.login)
    app.post("/logout", [], auth_controllers.logout)
    app.get("/getme", [auth_middleware.verifyjwttoken], auth_controllers.getMe)
}