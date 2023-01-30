require('dotenv').config('.env')
const puppeteer = require('puppeteer');

(async () =>
{
	const USER_MAIL = process.env.USER_MAIL
	const USER_PASS = process.env.USER_PASS
	const BASE_URL = process.env.BASE_URL
	
	let trainingsData, sectionsData
	
	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();
	await page.goto(BASE_URL);
	await page.type('#user_email', USER_MAIL);
	await page.type('#user_password', USER_PASS);
	await page.click('.form-actions input[name="commit"]');
	await page.waitForSelector('#primary-menu').then(async () => {
		// Go to coachings page
		await page.goto(`${BASE_URL}/coachings`);
		// Wait for page
		await page.waitForSelector('div#main-layout').then(async () => {
			// Loop through training cards
			trainingsData = await page.$$eval('div#main-layout div.row div.training-card', rows => {
				let a = [];
				for (i = 0, l = rows.length; i < l; i++)
				{
					if (rows[i].querySelector('a.training-date') != null)
					{
						// List training and URL
						a.push({
							date: rows[i].querySelector('a.training-date').textContent,
							url: rows[i].querySelector('a.training-date').getAttribute('href'),
						});
					}
				}
				return a;
			});
			// Go to training page
			for (i = 0, l = trainingsData.length; i < l; i++)
			// for (i = 0, l = 1; i < l; i++)
			{
				// Go to coachings page
				await page.goto(`${BASE_URL}${trainingsData[i].url}`);
				// Wait for page
				await page.waitForSelector('div#main-layout').then(async () => {
					// Loop through availability sections
					sectionsData = await page.$$eval('div#main-layout div.row div.availabilities-title-container', rows => {
						let a = [];
						for (j = 0, k = rows.length; j < k; j++)
						{
							// Get count if exists
							let el = rows[j].querySelector('span.count')
							if (el != null)
							{
								let b = {}
								b.count = el.textContent
								// Get title if exists
								el = rows[j].querySelector('span.title')
								if (el != null)
									b.title = el.textContent
								// Push section
								a.push(b)
								
								// TODO if title == 'Absences', get row parent.parent.nextSibling
								// let parent = rows[j].parentNode.parentNode.classList.join(',')
								// console.log(parent)
							}
						}
						return a;
					});
					console.log(sectionsData)
				})
			}
		});
	});
	await browser.close();
})();
