require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require('express-session');

const sequelize = require("./config/connection");
const { uploadToGcs } = require("./middleware/FileUpload");
const { singleImageUpload } = require("./middleware/ImageHandler");
const authenticatedJWT = require("./middleware/AuthenticatedJWT");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.use(passport.initialize());
app.use(passport.session());

sequelize
  .authenticate()
  .then(() => {
    console.log("Server Info: Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Server Info: Unable to connect to the database:", err);
  });


app.get("/", async (_, res) => {
  res.send("hello world");
});

app.use("/auth/google", require("./router/auth/google"));
app.use("/auth", require("./router/auth/local"));
app.use("/user", require("./router/user"));
app.use("/market", require("./router/market/barang"));
app.use("/market", require("./router/market/wishlist"));
app.use("/culture", require("./router/culture"));
app.use("/ml", require("./router/ml"));

const port = process.env.port || 8080;

app.listen(port, () => {
  console.log(`Server Info: Server Started in port ${port}`)
});