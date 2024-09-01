const post_controllers = require("../controllers/post.controller")
const auth_middleware = require("../middlewares/auth.middlewares")

module.exports = (app)=>{
    app.post("/createposts", [auth_middleware.verifyjwttoken], post_controllers.createposts)
    app.delete("/deletepost/:id", [auth_middleware.verifyjwttoken], post_controllers.deleteposts)
    app.post("/like/:id", [auth_middleware.verifyjwttoken], post_controllers.likeandunlike)
    app.post("/comment/:id", [auth_middleware.verifyjwttoken], post_controllers.comment)
    app.get("/all", [auth_middleware.verifyjwttoken], post_controllers.getallposts)
    app.get("/getlikedposts/:id", [auth_middleware.verifyjwttoken], post_controllers.getlikedposts)
    app.get("/following", [auth_middleware.verifyjwttoken], post_controllers.following)
    app.get("/user/:username", [auth_middleware.verifyjwttoken], post_controllers.getuserposts)
}

