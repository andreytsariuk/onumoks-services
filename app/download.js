var AWS = require('aws-sdk');
AWS.config.update(
  {
    accessKeyId: ".. your key ..",
    secretAccessKey: ".. your secret key ..",
  }
);
var s3 = new AWS.S3();

const fileName = 'test.pdf'

s3.getObject(
  { Bucket: "my-bucket", Key: fileName },
  function (error, data) {
    if (error != null) {
      console.log("Failed to retrieve an object: " + error);
    } else {
      saveFile(fileName, data);
    }
  }
);


var fs = require('fs');


function saveFile(fileName, fileData) {
  fs.writeFile(`/resources/${fileName}.pdf`, fileData, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

