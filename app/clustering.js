const { Clusters, Keywords, Knowledges, FilesType } = require('../models');
const FindWords = require('./findWords');
const ParseFile = require('./parseFile');
const { getKeyWords } = require('./findWords');
const Promise = require('bluebird');
const _ = require('lodash');
const { S3Service } = require('../services');
const http = require("http");
const fs = require('fs');
//TEsts
var filePath = path.join(__dirname, '../tests/test2.pdf')



function Clustering() {

  let [
    clusters,
    keywords,
    knowledges,
    documents
  ] = await Promise.all([
    new Clusters().fetchAll(),
    new Keywords().fetchAll(),
    new Knowledges().fetchAll(),
    new FilesType.Documents().fetchAll({ withRelated: ['keywords', 'file', 'file.user'] })
  ]);

  let new_clusters = [];

  _.forEach(documents.models, document => {



  });



}








async function parseRemoteFile(keywords) {
  const fileDestination = document.related('file').get('name');
  const file = fs.createWriteStream(fileDestination);

  let filePath = await S3Service.getFile({
    Bucket: req.file.get('bucket'),
    Key: req.file.get('key'),
    Expires: 10
  });

  await Promise
    .fromCallback(cb => http
      .get(filePath, res => {
        res.pipe(file);
        file.on('finish', () => file.close(cb));
      })
      .on('error', function (err) { // Handle errors
        fs.unlink(fileDestination); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
      })
    );

  //let fileText = await ParseFile.getTextAsync(filePath);
  let fileText = await ParseFile.getTextFromPdf(filePath);

  let foundKeywords = getKeyWords(fileText);

  let outerKeyWords = [];

  await Promise.map(foundKeywords, keyword => {
    let foundKeyWord = keywords.find(word => word.get('name') === keyword);
    if (foundKeyWord) {
      if (!foundKeyWord.get('hidden')) {
        outerKeyWords.push(foundKeyWord);
        return Promise.resolve();
      } else
        return Promise.resolve();
    }
    else
      return new Keywords({
        name: keyword
      })
        .save()
        .then(newKeyWord => outerKeyWords.push(foundKeyWord));

    return outerKeyWords;
  });


  //Check KeyWords
}