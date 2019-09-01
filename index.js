const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()

// Setup ENV
require('dotenv').config()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routers
app.use('/pendataan', require('./routes/pendataan'))

http.createServer(app).listen(process.env.PORT, () => {
	mongoose.connect(process.env.MONGO_URL, {
		useCreateIndex: true, useNewUrlParser: true
	}, err => {
		if(err) return process.exit()
		console.log('database connected')
	})
	console.log(`server connected at port ${ process.env.PORT }`)
})