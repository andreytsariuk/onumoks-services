const _ = require('lodash');
var path = require('path')
var pdf2Text = require('pdf2text')
const { getKeyWords } = require('./findWords');
var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();



function getTextAsync(filePath) {

  return pdf2Text(filePath).then(function (pages) {
    //pages is an array of string arrays 
    //loosely corresponding to text objects within the pdf
    let text = '';
    _.forEach(pages, page => text += page.join(''))
    return text;
  });
}


async function getTextFromPdf(filePath) {
  const fs = require('fs');
  console.log('filePath', filePath)
  const buffer = fs.readFileSync(filePath);
  //or parse a buffer of pdf data
  //this is handy when you already have the pdf in memory

  return new Promise((resolve, reject) => {
    let extracted = extractor.extract(filePath);
    extracted.then(function (doc) {
      console.log();
      resolve(doc.getBody());
    });
  });

}




module.exports = {
  getTextFromPdf,
  getTextAsync
}
