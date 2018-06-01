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

//TEsts

 function  download(document){
  const fileDestination = document.get('name');
 // console.log('START',fileDestination)
 // const file = fs.createWriteStream(`./src/${fileDestination}`);
//if (!fs.existsSync(`./src/${fileDestination}`)) {
        let file = fs.createWriteStream(`./src/${fileDestination}`);
    
        return  new Promise((resolve, reject) => {
          S3Service.getStream({
            Key: document.get('name'),
            Bucket: config.get('AWS.S3.bucket')
          }).createReadStream()
            .on('end', () => {
    console.log('REAL END',fileDestination)
    file.close();
        file.on('close',()=>resolve())
              
            })
            .on('error', (error) => {
   // console.log('REAL END',fileDestination)
              console.log('f000')
              //  return reject(error);
            }).pipe(file);
        });
 // }
  return Promise.resolve();
}


async function parseRemoteFile(document, keywords) {
  const fileDestination = document.get('name');

   // console.log('END',fileDestination)
  //let fileText = await ParseFile.getTextAsync(filePath);
  let fileText = await ParseFile.getTextFromPdf(`./src/${fileDestination}`);

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
      return new Keywords({
        name: keyword
      })
        .save()
        .then(newKeyWord => outerKeyWords.push(foundKeyWord))
        .catch(err=>console.log(err.code));
  });
  return outerKeyWords;
}



async function Clustering() {

  let [
    clusters,
    GlobalKeywords,
    knowledges,
    documents
  ] = await Promise.all([
    new Clusters().fetchAll(),
    new Keywords().fetchAll(),
    new Knowledges().fetchAll(),
    new FilesType.Articles().orderBy('id').fetchAll({ withRelated: ['file', 'file'] })
  ]);

  let new_clusters = [];
  let usedDocs = [];
  let centroids = [];
  console.log('Docs',_.map(documents.toJSON(),'id'))

await Promise.each(documents.models,model=>download(model));

let matrix =[];
  await Promise
    .each( documents.models, async(document) => {
      console.log('1 step', document.id)
      let keywords = await parseRemoteFile(document, GlobalKeywords);
      console.log('sdsd',_.map(usedDocs, 'document.id'))
      let afterMe =false;
      await Promise
        .each(documents.models, async (document2,index2) => {
          console.log('index2',index2)
          if(document2.id===document.id){
            afterMe=true
            return Promise.resolve();
          }
          if(document2.id!==document.id && !afterMe)
          return Promise.resolve();
          if(matrix[document2.id] && matrix[document2.id][document.id]) 
          return Promise.resolve();
          matrix[document.id]= matrix[document.id]? matrix[document.id]:[];
          matrix[document2.id]= matrix[document2.id]? matrix[document2.id]:[];

           let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

            let difference2 = keywords.length > keywords2.length ?
            100-_.difference(keywords2.map(key=>key.get('name')), keywords.map(key=>key.get('name'))).length / keywords.length * 100 :
           100-_.difference(keywords.map(key=>key.get('name')), keywords2.map(key=>key.get('name'))).length / keywords2.length * 100;
         console.log(document2.id, ' ', difference2);

         
         matrix[document.id][document2.id] = difference2;
         matrix[document2.id][document.id] = difference2;
         
         return Promise.resolve();
      });
      return Promise.resolve();
      
    });

    console.log('matrix',matrix)


  function rec(steps=[]){
    let [{id,min}] = _.reverse(steps);
    let newMin = _.minBy(matrix[id],el=>el!==min?el:99999);
    
    let minIndex = _.findIndex(matrix[id],el=>el===newMin);
    
    steps.push({
      min:newMin,
      id:minIndex
    });
    let duplicate=    _.filter(_.map(steps,'id'), function (value, index, iteratee) {
      return _.includes(iteratee, value, index + 1);
   });
    if(duplicate.length){
      return {
        min:newMin,
        id:minIndex,
        max: _.max(_.compact(_.map(steps,'min')))
      }
    }else
   return  rec(steps);
  }


  function getChilds(centroid){
    let childs =[];
    _.forEach(matrix[centroid.id],(el,index)=>{
      if (el && el<=centroid.max){
        childs.push({
          id: index
        })
      }
    });
    return childs;
  }

_.forEach(documents.models, doc=>{
  let centroid = rec([{id:doc.id}]);
  console.log('centroid',centroid)
  let childs = getChilds(centroid);
  console.log('childs',childs);

})


  await Promise
    .each( documents.models, async(document) => {
      if (_.map(usedDocs, 'document').length === documents.models.length)
        return Promise.resolve();
       
console.log('1 step', document.id)
      let keywords = await parseRemoteFile(document, GlobalKeywords);
      let centroid = await findCentroid([{
        document,
        keywords
      }], usedDocs,documents,GlobalKeywords);
      console.log('centroid',centroid.document.id)
      
      console.log('centroid',centroid.max)

      let clusterChildren = await findClusterChildren(centroid,documents,GlobalKeywords);
      new_clusters.push({
        centroid,
        clusterChildren
      });
      console.log('clusterChildren',_.map(clusterChildren,'document.id'))
      usedDocs = [...usedDocs, ...clusterChildren,...[centroid]];
      return Promise.resolve();
    });

  return await Promise
    .map(new_clusters, cluster =>{
      console.log('cluster.centroid.document.id',cluster.centroid.document.id)
      return new Clusters({
      centroid: cluster.centroid.document.id,
      workspace_id: cluster.centroid.document.related('file').get('workspace_id'),
      difference: cluster.centroid.max?cluster.centroid.max:50,
      color: randomColor({
        count: 10,
        hue: 'green'
      })
    })
      .save()
      .then(newCluster => {
        console.log('newCluster',cluster.centroid.document.id)
        console.log('cluster.clusterChildren',_.map(cluster.clusterChildren,'document.id'))
        console.log('MAx',cluster.centroid.max)
        
        
        return Promise
        .map(cluster.clusterChildren, child => child.document
          .save({
            cluster_id: newCluster.id
          }))}
      )
      .then(() => Promise
        .map(clusters.models, model => model.destroy())
      )}
    );

}




async function findCentroid(steps ,usedDocs,documents,GlobalKeywords) {
  console.log('sdsd',_.map(usedDocs, 'document.id'))
  let [{ document, keywords,difference }] = _.reverse(steps);
  let centroid = {};
  await Promise
    .each(documents.models, async (document2) => {
      if (!document || document2.id === document.id || _.map(usedDocs, 'document.id').indexOf(document2.id)!==-1){
        console.log('FOOO')
        return Promise.resolve();}

      let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

      let difference2 = keywords.length > keywords2.length ?
        100-_.difference(keywords2.map(key=>key.get('name')), keywords.map(key=>key.get('name'))).length / keywords.length * 100 :
        100-_.difference(keywords.map(key=>key.get('name')), keywords2.map(key=>key.get('name'))).length / keywords2.length * 100;
        console.log(document.id, ' ', difference2);
        console.log(document2.id, ' ', difference2);
        if(difference===difference2){
          console.log('FOOO2')
          return Promise.resolve();}


        if(!centroid.difference){
          centroid = {
            document: document2,
            keywords: keywords2,
            difference:difference2
          };
        }else if (centroid.difference && centroid.difference > difference2)
        centroid = {
          document: document2,
          keywords: keywords2,
          difference:difference2
        };
        return Promise.resolve();
    });
    steps.push(centroid);
console.log('findCentroid',centroid.difference);
    centroid =centroid.id?centroid:steps[0];

let duplicate=    _.filter(_.map(steps,'document.id'), function (value, index, iteratee) {
      return _.includes(iteratee, value, index + 1);
   });
console.log('duplicate',duplicate)
  if (duplicate.length){
//  console.log('steps',_.map(steps,'difference'))
    return ({
      ...centroid,
      max:_.maxBy(steps,(step)=>step.difference).difference
    });}
  else {
    
    return await findCentroid(steps,usedDocs,documents,GlobalKeywords);
  }
}


async function findClusterChildren(centroid,documents,GlobalKeywords) {
  let { document, keywords } = centroid;
  let children = [];
  await Promise
    .each(documents.models, async (document2) => {
      if (document2.id === document.id) return Promise.resolve();

      let keywords2 = await parseRemoteFile(document2, GlobalKeywords);

      let difference = keywords.length > keywords2.length ?
        100-_.difference(keywords2.map(key=>key.get('name')), keywords.map(key=>key.get('name'))).length / keywords.length * 100 :
        100-_.difference(keywords.map(key=>key.get('name')), keywords2.map(key=>key.get('name'))).length / keywords2.length * 100;

      if (centroid.max > difference){
        console.log('new Child',document2.id)
        children.push({
          document: document2,
          keywords: keywords2,
          difference
        });}
        return Promise.resolve();
    });
  return children;
}









 Clustering();