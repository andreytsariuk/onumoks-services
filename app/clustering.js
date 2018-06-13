const { Clusters, Keywords, Knowledges, FilesType } = require('../models');
const FindWords = require('./findWords');
const ParseFile = require('./parseFile');
const { getKeyWords } = require('./findWords');
const Promise = require('bluebird');
const _ = require('lodash');
const { S3Service } = require('../services');
const fs = require('fs');
const randomColor = require('randomcolor');
const path = require('path');
const config = require('config');
const Bookshelf = require('../config/bookshelf');
//TEsts

function download(document) {
  const fileDestination = document.get('name');
  // console.log('START',fileDestination)
  // const file = fs.createWriteStream(`./src/${fileDestination}`);
  if (!fs.existsSync(`./src/${fileDestination}`)) {
    console.log('SDSD')
    let file = fs.createWriteStream(`./src/${fileDestination}`);

    return new Promise((resolve, reject) => {
      S3Service.getStream({
        Key: document.get('name'),
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
  }
  return Promise.resolve();
}


async function parseRemoteFile(document, keywords) {
  const fileDestination = document.get('name');

  // console.log('END',fileDestination)
  //let fileText = await ParseFile.getTextAsync(filePath);
  let fileText = await ParseFile.getTextFromPdf(path.join(__dirname, `../src/${fileDestination}`));

  let foundKeywords = getKeyWords(fileText);

  let outerKeyWords = [];
  //Check KeyWords

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
      return Bookshelf.transaction(function (t) {
        return new Keywords({ name: keyword })
          .fetchAll({ require: true, transacting: t })
          .then(res => {
            if (res.models.length) {
              return res.models[0];
            } else
              throw new Error('keyword_not_found');
          })
          .catch(new Keywords({
            name: keyword
          })
            .save())
          .then(newKeyWord => outerKeyWords.push(newKeyWord))
          .catch(err => console.log(err.code));
      })


  })
    .catch(() => console.log('FOOOO'));
  return outerKeyWords;
}



async function Clustering() {
  try {
    let [
      clusters,
      GlobalKeywords,
      knowledges,
      documents
    ] = await Promise.all([
      new Clusters().fetchAll(),
      new Keywords().fetchAll(),
      new Knowledges().fetchAll(),
      new FilesType.Articles().orderBy('id', 'asc').fetchAll({ withRelated: ['file'] })
    ]);

    let new_clusters = [];
    let usedDocs = [];
    let centroids = [];
    console.log('Docs', _.map(documents.toJSON(), 'id'))

    await Promise.each(documents.models, model => download(model));

    let matrix = [];
    await Promise
      .each(documents.models, async (document) => {
        let keywords = await parseRemoteFile(document, GlobalKeywords);
        let afterMe = false;
        await Promise
          .each(documents.models, async (document2, index2) => {
            if (document2.id === document.id)
              return Promise.resolve();

            let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

            let keywords_1 = keywords.map(key => key.get('name'));
            let keywords_2 = keywords2.map(key => key.get('name'));
            let intersection = _.intersectionWith(keywords_1, keywords_2, _.isEqual).length;

            console.log(`[${document.id}][${document2.id}]`, intersection);
            matrix.push({
              document1: document,
              document2,
              intersection,
            })
            return Promise.resolve();
          });
        return Promise.resolve();

      });

    //console.log('matrix', matrix)


    let distances = [];

    _.forEach(documents.models, document => {
      let sumDistance = _.reduce(matrix, (sum, el) => sum += el.document1.id === document.id ? el.intersection : 0, 0);
      distances.push({
        document,
        sumDistance
      })
    });


    let used = [];
    let newClusters = [];
    let newClusters_view = [];
    while (used.length < documents.models.length) {
      let max = _.maxBy(_.filter(distances, el => used.indexOf(el.document.id) === -1), el => el.sumDistance);
      let dist = max.sumDistance / documents.models.length;
      let children = _.filter(matrix, el => el.document1.id === max.document.id && el.intersection >= dist && used.indexOf(el.document2.id) === -1);

      used = [...used, ...[max.document.id], ..._.map(children, 'document2.id')];

      newClusters.push({
        centroid: max,
        difference: dist,
        children: children
      });
      newClusters_view.push({
        centroid: max.document.related('file').get('title'),
        difference: dist,
        children: children.map(ch => ch.document2.related('file').get('title'))
      });
    }

    console.log('newClusters', newClusters_view);

    // process.exit(0);

    return await Promise
      .map(newClusters, cluster => {
        console.log('cluster.centroid.document.id', cluster.centroid.document.id)
        return new Clusters({
          centroid: cluster.centroid.document.id,
          workspace_id: cluster.centroid.document.related('file').get('workspace_id'),
          difference: cluster.difference,
          color: randomColor({
            count: 10,
            hue: 'green'
          })
        })
          .save()
          .then(newCluster => {
            console.log('newCluster', cluster.centroid.document.id)
            console.log('MAx', cluster.difference)
            return Promise
              .map(cluster.children, child => child.document2
                .save({
                  cluster_id: newCluster.id
                }));
          });
      });

  } catch (error) {
    console.log(error)
  }

}




// async function findCentroid(steps, usedDocs, documents, GlobalKeywords) {
//   console.log('sdsd', _.map(usedDocs, 'document.id'))
//   let [{ document, keywords, difference }] = _.reverse(steps);
//   let centroid = {};
//   await Promise
//     .each(documents.models, async (document2) => {
//       if (!document || document2.id === document.id || _.map(usedDocs, 'document.id').indexOf(document2.id) !== -1) {
//         console.log('FOOO')
//         return Promise.resolve();
//       }

//       let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

//       let difference2 = keywords.length > keywords2.length ?
//         100 - _.difference(keywords2.map(key => key.get('name')), keywords.map(key => key.get('name'))).length / keywords.length * 100 :
//         100 - _.difference(keywords.map(key => key.get('name')), keywords2.map(key => key.get('name'))).length / keywords2.length * 100;
//       console.log(document.id, ' ', difference2);
//       console.log(document2.id, ' ', difference2);
//       if (difference === difference2) {
//         console.log('FOOO2')
//         return Promise.resolve();
//       }


//       if (!centroid.difference) {
//         centroid = {
//           document: document2,
//           keywords: keywords2,
//           difference: difference2
//         };
//       } else if (centroid.difference && centroid.difference > difference2)
//         centroid = {
//           document: document2,
//           keywords: keywords2,
//           difference: difference2
//         };
//       return Promise.resolve();
//     });
//   steps.push(centroid);
//   console.log('findCentroid', centroid.difference);
//   centroid = centroid.id ? centroid : steps[0];

//   let duplicate = _.filter(_.map(steps, 'document.id'), function (value, index, iteratee) {
//     return _.includes(iteratee, value, index + 1);
//   });
//   console.log('duplicate', duplicate)
//   if (duplicate.length) {
//     //  console.log('steps',_.map(steps,'difference'))
//     return ({
//       ...centroid,
//       max: _.maxBy(steps, (step) => step.difference).difference
//     });
//   }
//   else {

//     return await findCentroid(steps, usedDocs, documents, GlobalKeywords);
//   }
// }


// async function findClusterChildren(centroid, documents, GlobalKeywords) {
//   let { document, keywords } = centroid;
//   let children = [];
//   await Promise
//     .each(documents.models, async (document2) => {
//       if (document2.id === document.id) return Promise.resolve();

//       let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

//       let difference = keywords.length > keywords2.length ?
//         100 - _.difference(keywords2.map(key => key.get('name')), keywords.map(key => key.get('name'))).length / keywords.length * 100 :
//         100 - _.difference(keywords.map(key => key.get('name')), keywords2.map(key => key.get('name'))).length / keywords2.length * 100;

//       if (centroid.max > difference) {
//         console.log('new Child', document2.id)
//         children.push({
//           document: document2,
//           keywords: keywords2,
//           difference
//         });
//       }
//       return Promise.resolve();
//     });
//   return children;
// }









Clustering();























