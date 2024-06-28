//i used puppeteer => to launch headless browser and handle dynamic content of twitter
//cheerio => to scrape HTML content and get data from websites
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

//array includes all our targets
const tAccounts = [
  'Mr_Derivatives', 'Barchart','warrior_0719',
  'ChartingProdigy','allstarcharts',
  'yuriymatso','TriggerTrades','AdamMancini4',
  'CordovaTrades','RoyLMattox'
];
//Stock Symbol to search for it on twitter
const stockSymbol = '$SPX';

let rounds = 0;

const interval = 15//interval in minutes

//function => scrapes each twitter acc 
//'account' parameter => twitter acc username to be scraped
const scrape= async (account)=> {
    try {
      const url = `https://twitter.com/${account}`;

    //puppeteer.launch launching headless browser
      const browser = await puppeteer.launch({
       
        //to disable sandboxing feature on chrommium based browsers
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
     
      const page = await browser.newPage();  // opening a new page in the browser
     
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      await page.waitForSelector('article'); //navigate to url
     
      // getting the HTML page content
      const HTMLdata = await page.content();
      await browser.close();//close browser


    // cheerio.load => load html page content to parsing it
      const $ = cheerio.load(HTMLdata);

      let count = 0; //intialize counter for StockSymbol tracking
            
      // Iterate over each article element 
      $('article').each((i, ele) => {
        const text = $(ele).text().toLowerCase(); //text inside <article>
        console.log(`Scraping ${account} - Article ${i}: ${text.slice(0, 100)}`);
      
        // check if the text includes the stockSymbol
        if (text.includes(stockSymbol.toLowerCase())) {
          //  our counter increase each time stockSymbol found
          count++;
        }
      });
  
      return count;   //Returning the total count of stockSymbol mentions
    } catch (error) {
      console.error(`cannot scraping ${account}:`, error);
      return 0;
    }
  }

  // function to scrape all acc and get the results
  const scrapeTAccounts = async() =>{
    let totalCount = 0; //the total counter for all accs
   
    // Loop through each acc in the list
    for (const account of tAccounts) {

    // implement scrape func to each account
      const count = await scrape(account);
      
      totalCount += count; // count of mentions from each acc + total count
    }
    const result = `"${stockSymbol}" was mentioned "${totalCount}" times in the last ${interval} minutes.`;

    rounds++
    console.log(rounds, result);



}
  scrapeTAccounts()

  // run scrapeTAccounts functiond every interval minutes
  setInterval(scrapeTAccounts, interval*60*1000);

