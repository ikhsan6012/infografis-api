const puppeteer = require('puppeteer-core')

const run = async () => {
	try {
		let width = 900, height = 600, url = 'https://www.google.com/maps/@-6.160164,106.6872189,15z?hl=en'
		const browser = await puppeteer.launch({
			ignoreHTTPSErrors: true,
			headless: false,
			executablePath: '/usr/bin/google-chrome',
			defaultViewport: { width, height },
			// devtools: true,
			args: [ `--window-size=${ width },${ height }` ]
		})
		const page = await browser.newPage()
		await page.goto(url, { waitUntil: "networkidle2" })
		await page.type('#searchboxinput', 'menara citicon')
		await page.click('#searchbox-searchbutton')
		await page.waitForFunction(() => !!document.URL.match(/\!3d.+\!4d/))
		let ll = page.url().match(/(?<=\!3d)\-.{0,}(?=\?)/)[0].replace('!4d', ',')
		url = `https://www.google.com/maps/@${ ll },17z?hl=en`
		await page.goto(url, { waitUntil: "networkidle2" })
		console.log('ok')
	} catch (error) {
		console.log(error)
		process.exit()
	}
}
run()