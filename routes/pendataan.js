const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const path = require('path')
const jsonexport = require('jsonexport')

// const sampleGmapsDataModel = require('../models/sampleGmapsData')
// const mfwpModel = require('../models/mfwp')

router.get('/gmap-crawl', async (req, res) => {
	const { input, counts, output } = req.query
	let datas = []
	let browser
	try {
		browser = await puppeteer.launch({
			// headless: false,
			executablePath: '/usr/bin/google-chrome',
		})
		const page = await browser.newPage()
		await page.goto('https://www.google.com/maps/@-6.2087634,106.845599,15z')
		await page.waitFor(500)
		await page.waitFor('#searchboxinput')
		await page.type('#searchboxinput', input, { delay: 75 })
		await page.keyboard.press('Enter')
		await page.waitFor(500)
		await page.waitFor('.section-result-header')
		let i = 0, j = 0
		let itemsLength
		while(j < (parseInt(counts) || 10)){
			const items = await page.$$('.section-result')
			itemsLength = items.length
			await items[i].click()
			await page.waitFor(2500)
			try {
				await page.waitFor('.section-hero-header-image-hero')
				let data = await page.evaluate(() => {
					const getText = (nodes, separator = '') => {
						return [...nodes].map(e => e.textContent.trim()).join(separator)
					}

					const getSteetAddress = addr => {
						addr = addr.split(',')
						let length = addr.length
						let StreetAddress = addr.filter((v, i) => i < length - 2)
						return StreetAddress.join(',').trim()
					}

					const getCity = addr => {
						addr = addr.split(',')
						let length = addr.length
						return addr.find((v, i) => i == length - 2).trim()
					}

					const getstate = addr => {
						addr = addr.split(',')
						let length = addr.length
						let State = addr.find((v, i) => i == length - 1)
						State = State.split(/ \d+/)[0]
						return State.trim()
					}

					const getZip = (addr, state) => {
						addr = addr.split(',')
						let length = addr.length
						let Zip = addr.find((v, i) => i == length - 1)
						Zip = Zip.split(state)[1]
						return Zip.trim()
					}

					const getNumberOfPhotos = nodes => {
						let NumberOfPhotos = [...nodes].find(e => e.querySelector('.b7bAA58T9bH__pano[style]'))
						if(!NumberOfPhotos) return 0
						return NumberOfPhotos.textContent.replace(/\D/g, '')
					}
					
					let BusinessName = getText(document.querySelectorAll('.section-hero-header-title-title'))
					let FullAddress = getText(document.querySelectorAll('[data-section-id="ad"][data-tooltip]'))
					let StreetAddress = getSteetAddress(FullAddress)
					let City = getCity(FullAddress)
					let State = getstate(FullAddress)
					let Zip = getZip(FullAddress, State)
					let PlusCode = getText(document.querySelectorAll('[data-section-id="ol"].section-info'))
						.split(' ')[0]
					let Website = getText(document.querySelectorAll('[data-section-id="ap"][data-tooltip]'))
					let Phone = getText(document.querySelectorAll('[data-section-id="pn0"][data-tooltip]'))
					let LatLong = document.URL.split(/[!]3d|[!]4d|[?]/).filter((v, i) => i == 1 || i == 2).join(', ')
					let Category = getText(document.querySelectorAll('.section-rating-term')).split(/\xB7|\)/)
						.filter(v => v != '')[1]
					let Hours = [...document.querySelectorAll('.section-open-hours-container')]
						.map(e => e.getAttribute('aria-label'))
						.join('')
					let IsClaimed = document.querySelector('[data-section-id="mcta"]') ? 'N' : 'Y'
					let Rating = getText(document.querySelectorAll('.section-star-display'))
					let ReviewCount = getText(document.querySelectorAll('[jsaction="pane.reviewChart.moreReviews"]'))
						.split(' ')[0]
						.replace(/\./g, '')
					let Amenities = [...document.querySelectorAll('.dE2CwA59lTo__container')]
						.map(e => e.textContent.trim())
						.join(', ')
					let NumberOfPhotos = getNumberOfPhotos(document.querySelectorAll('.b7bAA58T9bH__label'))
					let ImageURL = [...document.querySelectorAll('.section-hero-header-image-hero')]
						.map(e => e.firstElementChild ? e.firstElementChild.src : '')[0]
					let URL = document.URL
					return { 
						BusinessName, FullAddress, StreetAddress, City, State, Zip, PlusCode, Website, Phone, LatLong, Category,
						Hours, IsClaimed, Rating, ReviewCount, Amenities, NumberOfPhotos, ImageURL, URL
					}
				})
				// const sampleGmapsData = new sampleGmapsDataModel(data)
				// data = await sampleGmapsData.save()
				datas.push(data)
				console.log(data)
			} catch(err) {
				console.log(err)
			}
			await page.waitFor(1000)
			await page.waitFor('.section-back-to-list-button')
			await page.click('.section-back-to-list-button')
			await page.waitFor(500)
			await page.waitFor('.section-result-header')
			if(i === itemsLength - 1) {
				const isNext = await page.evaluate(() => !document.querySelector('[jsaction="pane.paginationSection.nextPage"]').disabled)
				if(isNext == true){
					await page.click('[jsaction="pane.paginationSection.nextPage"]')
					await page.waitFor(2000)
					await page.waitFor('.section-result-header')
					i = 0
				} else {
					break
				}
			} else {
				i++
			}
			j++
		}
		await browser.close()
		res.json({ err: false, data: datas })
	} catch (err) {
		if(browser) await browser.close()
		console.log(err)
		res.json({ err: err, data: datas })
	}
	jsonexport(datas, (err, csv) => {
		if(err) return console.log(err)
		console.log(datas.length)
		fs.writeFileSync(path.resolve(__dirname, '..', 'results', output + '.csv'), csv)
		console.log('success')
	})
	datas = []
})

router.get('/compare-mfwp', async (req, res) => {
	try {
		let data = await sampleGmapsDataModel.find({}, 'BusinessName')
		let data2 = []
		for(let i = 0; i < data.length; i++) {
			let d = data[i].BusinessName.split(/pt\.|pt|\(|\)|\-/i).filter(v => v != '')
			data2.push(d)
		}
		console.log(data2)
		res.json(data2)
	} catch (err) {
		console.log(err)
		res.json({ err: err })
	}
})

module.exports = router