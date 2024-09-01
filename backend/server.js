const express = require("express")
const app = express()
const mongoose = require("mongoose")
const db_config = require("../config/db.config")
const server_config = require("../config/server.config")
const cookieParser = require("cookie-parser")
const cloudinary = require("cloudinary").v2
const clodinary_config = require("../config/clodinary.config")

cloudinary.config({
    cloud_name : clodinary_config.CLOUD_NAME,
    api_key : clodinary_config.API_KEY,
    api_secret : clodinary_config.API_SECRET
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Connection with database
mongoose.connect(db_config.DB_URI)
const db = mongoose.connection
db.on("error", ()=>{
    console.log("Error while connecting to Database")
})
db.once("open", ()=>{
    console.log("Connected to mongodb successfully")
})

require("./routes/auth.route")(app)
require("./routes/user.route")(app)
require("./routes/post.route")(app)
require("./routes/notification.route")(app)
app.listen(server_config.PORT, ()=>{
    console.log("Server is running", server_config.PORT)
})