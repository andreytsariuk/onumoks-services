const { S3Service } = require('../services');
const config = require('config');
const testFolder = './src/';
const fs = require('fs');



function download(document) {
  console.log('file', document)

  const fileDestination = document;
  if (!fs.existsSync(`./src/${fileDestination}`)) {
    let file = fs.createWriteStream(`./src/${fileDestination}`);
    return new Promise((resolve, reject) => {
      S3Service.getStream({
        Key: document,
        Bucket: config.get('AWS.S3.bucket')
      }).createReadStream()
        .on('end', () => {
          console.log('REAL END', fileDestination)
          file.close();
          file.on('close', () => resolve())

        })
        .on('error', (error) => {
          // console.log('REAL END',fileDestination)
          console.log('f000')
          //  return reject(error);
        }).pipe(file);
    });
  } else {
    console.log('File exists')
    return Promise.resolve();
  }
}



// S3Service.get({
//   Key: 'b89b5f1d2be1a554358249f56f272c841527823043727.pdf',
//   Bucket: config.get('AWS.S3.bucket')
// }).then(res => {
//   console.log('res', res);



var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();
var extracted = extractor.extract("./src/docs/test.doc");
extracted.then(function (doc) {
  console.log(doc.getBody());
});


// fs.readdir(testFolder, (err, files) => {
//   files.forEach(file => {
//     download(file);
//   });
// })
