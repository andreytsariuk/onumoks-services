var pdfreader = require('pdfreader');
var WordPOS = require('wordpos'),
  wordpos = new WordPOS();
var rows = {}; // indexed by y-position
var keyword_extractor = require("keyword-extractor");

function printRows() {
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) => console.log((rows[y] || []).join('')));
}

new pdfreader.PdfReader().parseFileItems('CV_ErhanYasar.pdf', function (err, item) {
  if (!item || item.page) {
    // end of file, or page
    printRows();
    console.log('PAGE:', item.page);
    rows = {}; // clear rows for next page
  }
  else if (item.text) {
    // accumulate text items into rows object, per line
    (rows[item.y] = rows[item.y] || []).push(item.text);
  }
});




function parseRow(rowText) {

  //split by words
  let words = FindWords(rowText);





}

function FindWords(text) {
  return keyword_extractor.extract(sentence, {
    language: "russian",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true

  });
};

function findWords2(text) {
  text += " ";

  var words = [],
    word = [],
    limit = text.length, code, index;

  for (index = 0; index < limit; index += 1) {
    code = text.charCodeAt(index);
    if (~_.indexOf(letters, code, true)) {
      word.push(text[index])
    } else {
      if (word.length) {
        words.push(word.join(''));
        word = [];
      }
    }
  }
  return words;
};