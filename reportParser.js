let DOMParser = require('xmldom').DOMParser;
let fs = require('fs');
let AWS = require('aws-sdk');
require('./auth.js');


var comprehend = new AWS.Comprehend({apiVersion: '2018-12-01'});
var NLPText ="In Today's Podcast,<break time=\"1s\"/> ";

const reportsLocation = 'Reports/';
const reports = ['11900142.xml', '11902796.xml', '11905814.xml', '11905880.xml', '11908298.xml'];

// file where report summaries are stored
//const concatenatedReportsFile = 'concatenatedReports.txt';
const concatenatedReportsFileSSML = 'concatenatedReportsSSML.txt';
const acronymMapFile = 'acronymMap.json';

// Maps for converting short forms to full words
let tickerMap = new Map();
let acronymMap;

// Array of parsed texts
let parsedReportTexts = [];
let parsedReportTextsForNLP = [];
let parsedReportTextsSSML = [];

// Array of reports texts after removing acronym
let summarizedReportTexts = [];
let summarizedReportTextsSSML = [];
let concatenateReportText;


// Function to parse reports and extract summary
let parseReport = function(reportName) {
  let parsedReport = '';
  let xmlReport1 = fs.readFileSync(reportsLocation + reportName, 'utf8', function (err, data) {
    if (err) console.log(err);
    else {
      return data;
    }
  });

  let report = new DOMParser().parseFromString(xmlReport1, 'text/xml');
  let htmlMetaDataElements = report.getElementsByTagName('HtmlMetadata');
  let htmlMetaData = htmlMetaDataElements.item(0);

  let reportTitle = htmlMetaData.getAttribute('Title');
  let reportSubtitle = htmlMetaData.getAttribute('Subtitle');

  parsedReport = reportTitle;

  // console.info(reportTitle);
  // console.info(reportSubtitle);

  let companyName = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('DisplayName');
  let shortName = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('Name');
  let ticker = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('Ticker');

  tickerMap.set(ticker, shortName);

  // console.info(companyName);
  // console.info(shortName);
  // console.info(ticker);

  let price = htmlMetaData.getElementsByTagName('Price').item(0);

  let rating = price.getAttribute('Rating');
  let actualPrice = price.getElementsByTagName('Actual').item(0).childNodes[0].nodeValue;
  let priceObjective = price.getElementsByTagName('Objective').item(0).childNodes[0].nodeValue;
  let currency = price.getElementsByTagName('MeasureCurrency').item(1).getAttribute('IsoCode');

  let upside = ((Number(priceObjective) - Number(actualPrice)) / Number(actualPrice) * 100).toFixed(2) + '%';
  // console.log("upside: " + upside);

  parsedReport = parsedReport + ' We reiterate ' + rating + ' rating, with a price objective of ' + priceObjective + ' ' + currency
  + ' and an upside of ' + upside + ' for ' + companyName + '.';

  // console.info(rating);
  // console.info(priceObjective);
  // console.info(currency);

  let summaryElements = report.getElementsByTagName('Summary');

  let summaryPoints = summaryElements.item(0).getElementsByTagName('li');

  let reportSummary = '';

  for(let i = 0; i < summaryPoints.length; i++) {
    reportSummary = reportSummary + ' ' + summaryPoints.item(i).childNodes[0].nodeValue;
    if(reportSummary.charAt(reportSummary.length - 1) != '.') {
        reportSummary = reportSummary + '.';
    }
  }
  parsedReport = parsedReport + reportSummary + ' ';

  // console.info(parsedReport);
  return parsedReport;
};

// Function to read from acronymMap.json file and load into acronymMap data
// structure
let initializeAcronymMap = function() {
  let jsonStr = fs.readFileSync(acronymMapFile, 'utf8', function (err, data) {
    if (err) console.log(err);
    else {
      return data;
    }
  });
  return new Map(JSON.parse(jsonStr));
}

// Function replace acronym and tickers with full words
let removeAcronyms = function(reportText) {

  let regexStr;
  for(const [ticker, name] of tickerMap.entries()) {
    regexStr = '\\b' + ticker + '\\b';
    reportText = reportText.replace(new RegExp(regexStr, 'g'), name);
  }

  for(const [acronym, fullWord] of acronymMap.entries()) {
    if(acronym.charAt(acronym.length - 1) == '.') {
      regexStr = '\\b' + acronym;
    } else {
      regexStr = '\\b' + acronym + '\\b';
    }
    reportText = reportText.replace(new RegExp(regexStr, 'g'), fullWord);
  }
  // console.log(reportText);

  return reportText;
};

// function to get date in long format
let getTodaysDate = function() {
  let today = new Date();
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
  return today.toLocaleDateString('en-US', options);
}


// Add acronym to fullWord mappings from acronymMap.json
acronymMap = initializeAcronymMap();

// Parse 5 reports, extract summary and key takeaways
reports.forEach(function(report) {
  parsedReportTexts.push(parseReport(report));
});

// Concatenate the report texts and save to file
// concatenateReportTexts(summarizedReportTexts, concatenatedReportsFile);

// SSML tags
// -----------------------------------------------------------------------------------------------------------------------

let parseReportSSML = function(reportName) {
  let parsedReport = '';
  let xmlReport1 = fs.readFileSync(reportsLocation + reportName, 'utf8', function (err, data) {
    if (err) console.log(err);
    else {
      return data;
    }
  });

  let report = new DOMParser().parseFromString(xmlReport1, 'text/xml');
  let htmlMetaDataElements = report.getElementsByTagName('HtmlMetadata');
  let htmlMetaData = htmlMetaDataElements.item(0);

  let reportTitle = htmlMetaData.getAttribute('Title');
  let reportSubtitle = htmlMetaData.getAttribute('Subtitle');

  parsedReport = '<emphasis>' + reportTitle + '</emphasis>  <break time=".5s"/>';

  // console.info(reportTitle);
  // console.info(reportSubtitle);

  let companyName = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('DisplayName');
  let shortName = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('Name');
  let ticker = htmlMetaData.getElementsByTagName('Instrument').item(0).getAttribute('Ticker');

  tickerMap.set(ticker, shortName);

  // console.info(companyName);
  // console.info(shortName);
  // console.info(ticker);

  let price = htmlMetaData.getElementsByTagName('Price').item(0);

  let rating = price.getAttribute('Rating');
  let actualPrice = price.getElementsByTagName('Actual').item(0).childNodes[0].nodeValue;
  let priceObjective = price.getElementsByTagName('Objective').item(0).childNodes[0].nodeValue;
  let currency = price.getElementsByTagName('MeasureCurrency').item(1).getAttribute('IsoCode');

  let upside = ((Number(priceObjective) - Number(actualPrice)) / Number(actualPrice) * 100).toFixed(2) + '%';
  // console.log("upside: " + upside);

  parsedReport = parsedReport + ' We reiterate <break/> ' + rating + ' rating, with a price objective of ' + priceObjective + ' ' + currency
  + '<break/> and an upside of ' + upside + ' for ' + companyName + '.<break/> \n';

  // console.info(rating);
  // console.info(priceObjective);
  // console.info(currency);

  let summaryElements = report.getElementsByTagName('Summary');

  let summaryPoints = summaryElements.item(0).getElementsByTagName('li');

  let reportSummary = '';

  for(let i = 0; i < summaryPoints.length; i++) {
	  /** NLP Piece start */
	  if(i==0){
		  if(parsedReportTextsForNLP.length<2){
			  // For NLP use the first two reports for key phrases
		  parsedReportTextsForNLP.push(removeAcronyms(summaryPoints.item(i).childNodes[0].nodeValue));
		  }
	  }
	  /** NLP Piece End */
	  reportSummary = reportSummary + ' ' + summaryPoints.item(i).childNodes[0].nodeValue +' \n';
    if(reportSummary.charAt(reportSummary.length - 1) != '.') {
        reportSummary = reportSummary + '. <break/> \n';
    }
  }
  
  
  
  parsedReport = parsedReport + reportSummary + '<break time=".5s"/> \n';

  // console.info(parsedReport);
  return parsedReport;
};


// Parse 5 reports, extract summary and key takeaways
reports.forEach(function(report) {
  parsedReportTextsSSML.push(parseReportSSML(report));
});

// Remove acronyms from parsed reports
parsedReportTextsSSML.forEach(function(parsedReportText) {
  summarizedReportTextsSSML.push(removeAcronyms(parsedReportText));
});



// Function to concatenate reports, add SSML tags and store to file
let concatenateReportTextsSSML = function(reportTexts, concatenatedReportsFileSSML) {

  let concatenatedReportText = '<speak>\n Welcome to the Reasearch Podcast for ' + getTodaysDate() + '. ';
  
  console.log('NLPText:: '+ NLPText);
  concatenatedReportText=concatenatedReportText+'  ' +NLPText;
  
  reportTexts.forEach(function(report) {
    concatenatedReportText = concatenatedReportText +'<p>' + report + '</p> \n';
  });
  concatenatedReportText = concatenatedReportText + ' This concludes today\'s Reasearch Podcast. Thank you for listening! \n</speak>';
  // console.log(concatenatedReportText);

  fs.writeFile(concatenatedReportsFileSSML, concatenatedReportText, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log(concatenatedReportsFileSSML + ' saved successfully!');
    }
  });

};


// NLP - need the last 3 reports for detecting entities
var gotNLPResponse=false;
var reportcounter=0;

parsedReportTexts.forEach(function(parsedReportText) {
	reportcounter=reportcounter+1;
	if(reportcounter>2)
		{
		parsedReportTextsForNLP.push(removeAcronyms(parsedReportText));
		}
});

//console.log(parsedReportTextsForNLP);





//console.log('gotNLPResponse'+gotNLPResponse);

var params1 = {
		  LanguageCode: 'en', /* required */
		  Text: parsedReportTextsForNLP[0] /* required */
		};
comprehend.detectKeyPhrases(params1, function(err, data) {
	if (err) console.log(err, err.stack); // an error occurred
	else     
		NLPText = NLPText + data.KeyPhrases[0].Text + '<break/>' + data.KeyPhrases[1].Text + ',<break time=".5s"/>' ; 
		//console.log(NLPText);// successful response
		params1 = {
					LanguageCode: 'en', /* required */
					Text: parsedReportTextsForNLP[1] /* required */
				};
		//console.log(parsedReportTextsForNLP[1]);
		comprehend.detectKeyPhrases(params1, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else     
				NLPText = NLPText + data.KeyPhrases[0].Text + '<break/>' + data.KeyPhrases[1].Text + ',<break time=".5s"/>';// successful
				//console.log(NLPText);
				params2 = {
						LanguageCode: 'en', /* required */
						Text: parsedReportTextsForNLP[2] /* required */
					};
				comprehend.detectEntities(params2, function(err, data) {
					if (err) console.log(err, err.stack); // an error
					else     
						//console.log(data);
						NLPText = NLPText + ' and our thoughts on ' + data.Entities[0].Text	+ ', <break/>';// successful
						//console.log(NLPText);
						params3 = {
								LanguageCode: 'en', /* required */
								Text: parsedReportTextsForNLP[3] /* required */
							};
						comprehend.detectEntities(params3, function(err, data) {
							if (err) console.log(err, err.stack); // an error
							else     
								//console.log(data);
								NLPText = NLPText + data.Entities[0].Text	+ ',<break/>';// successful
								//console.log(NLPText);
								params4 = {
										LanguageCode: 'en', /* required */
										Text: parsedReportTextsForNLP[4] /* required */
									};
								comprehend.detectEntities(params4, function(err, data) {
									if (err) console.log(err, err.stack); // an error
									else     
										//console.log(data);
										NLPText = NLPText + ' and '+data.Entities[0].Text	+ '.<break time="1s"/>';// successful
										//console.log(NLPText);
										//console.log('gotNLPResponse'+gotNLPResponse);
										// Concatenate the report texts with SSML tags and save to file
										concatenateReportTextsSSML(summarizedReportTextsSSML, concatenatedReportsFileSSML);
						});
						});
				});
			});
			
});




