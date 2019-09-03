require('dotenv').config()
const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const puppeteer = require('puppeteer-core')
const app = express()

// Setup ENV
require('dotenv').config()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/import-mpn', async (req, res) => {
	try {
		const baseURL = 'https://appportal/'
		const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe"
		const browser = await puppeteer.launch({
			headless: false,
			executablePath,
			args: [ '--ignore-certificate-errors' ]
		})
		const page = await browser.newPage()
		const { USER_SIKKA, PASS_SIKKA } = process.env
		await page.goto(baseURL + 'login', { waitUntil: 'networkidle2' })
		await page.type('[name=username]', USER_SIKKA)
		await page.type('[name=password]', PASS_SIKKA)
		await Promise.all([
			page.click('#loginsub'),
			page.waitForNavigation({ waitUntil: 'networkidle0' })
		])
		const li1 = await page.$('#smoothmenu1 > ul > li:nth-child(2)')
		await li1.hover()
		const li2 = li1.$('ul > li:nth-child(3)')
		await li2.hover()
		// await page.click('#mpnharianrekon')
		// await page.waitFor('#dd_map')
		// await page.evaluate(() => document.querySelector('#tgl_akhir').value = 31)
		// await page.click('#btndownload')
		// await page.waitForResponse('https://appportal/portal/mpnharianrekon/download.php')
		// console.log('test')
	} catch (err) {
		console.log(err)
	}
})

// Routers
app.use('/pendataan', require('./routes/pendataan'))

http.createServer(app).listen(process.env.PORT, () => {
	// mongoose.connect(process.env.MONGO_URL, {
	// 	useCreateIndex: true, useNewUrlParser: true
	// }, err => {
	// 	if(err) return process.exit()
	// 	console.log('database connected')
	// })
	console.log(`server connected at port ${ process.env.PORT }`)
})