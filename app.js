const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan')

const app = express();
require('dotenv').config();

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))
app.use(cookieParser())


//routes
const home = require('./routes/home')
const user = require('./routes/user')

//router middleewares
app.use("/api/v1", home)
app.use("/api/v1", user)



module.exports = app;