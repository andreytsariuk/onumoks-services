const _ = require('lodash');
var path = require('path')
var pdf2Text = require('pdf2text')
const { getKeyWords } = require('./findWords');
var pdfUtil = require('pdf-to-text');
var pdf_path = "absolute_path/to/pdf_file.pdf";




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
  //and don't want to write it to a temp file
  // return pdf2Text(buffer)
  //   .then(function (pages) {
  //     let text = '';
  //     _.forEach(pages, page => text += page.join(''))
  //     return text;
  //   });
  return new Promise((resolve, reject) => {
    pdfUtil.pdfToText(pdf_path, function (err, data) {
      if (err) reject(err);
      console.log(data);
      resolve(data)
    });
  })

}




module.exports = {
  getTextFromPdf,
  getTextAsync
}
