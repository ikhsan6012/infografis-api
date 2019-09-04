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
		await page.evaluate(() => document.querySelector('#mpnharianrekon').click())
		await page.waitFor('#dd_map')

		await page.evaluate(() => document.querySelector('#tgl_akhir').value = 31)
		await page.click('#btndownload')
		const urls = await page.evaluate(() => {
			const kpps = [...document.querySelectorAll('#dd_nas_kpp > option')]
				.map(opt => opt.value)
			console.log('kpps.length', kpps.length)
			const months = [...document.querySelectorAll('#bln_awal > option')]
				.map(opt => opt.value)
			console.log('months.length', months.length)
			const valutas = [...document.querySelectorAll('#valuta > option')]
				.map(opt => opt.value)
			console.log('valutas.length', valutas.length)
			
			let datas = []
			for(let i = 0; i < kpps.length; i++){
				for(let j = 0; j < months.length; j++){
					for(let k = 0; k < valutas.length; k++){
						datas.push(`https://appportal/portal/download/lsnfjkasbnfjnasjkfnjbnjnjknbkjnfjknbjkfnbkjfnbi3939489184.php?p1=${ kpps[i] }20194111000000131${ months[j] }${ valutas[k] }`)
						k++
					}
					j++
				}
				i++
			}
			console.log('datas.length', datas.length)
			return datas
		})
		console.log(urls.length)
		for(let url of urls){
			const page2 = await browser.newPage()
			try {
				await page2.goto(url)
				page2.close()
			} catch (err){}
		}
		res.json({ ok: 1 })
	} catch (error) {
		console.log(error)
		res.json({ ok: 0, error })
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