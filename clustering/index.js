

let knowleges = [
  {
    id: 1,
    name: 'programming'
  },
  {
    id: 2,
    name: 'linerial algebra'
  }
];

let lectors_knowleges = [
  {
    id: 2,
    knowlege_id: 1,
    lector_id: 1
  },
  {
    id: 2,
    knowlege_id: 1,
    lector_id: 1
  }
];

let keywords_knowleges = [
  {
    id: 2,
    knowlege_id: 1,
    keyword_id: 1
  },
  {
    id: 2,
    knowlege_id: 2,
    keyword_id: 2
  }
];

let keyWords = [
  {
    id: 1,
    word: 'foo',

  },
  {
    id: 2,
    word: 'Mathan'
  }
];


let documents_keywords = [
  {
    id: 2,
    document_id: 1,
    keyword_id: 1
  },
  {
    id: 2,
    document_id: 1,
    keyword_id: 1
  }
]

let documents = [
  {
    id: 1,
    name: 'Diplom Tsariuk',
    filepath: 'http://fooo/s3.file.pdf',
    user_id: 1
  },
  {
    id: 2,
    name: 'Diplom222 Tsariuk',
    filepath: 'http://fooo/s3.file.pdf',
    user_id: 2
  }
]


let clusters = [
  {
    id: 1,
    name: 'Programming',
    center_file: 1
  },
  {
    id: 2,
    name: 'Mathan',
    center_file: 2
  }

]


let newFile = {
  id: 2,
  name: 'Diplom222 Tsariuk',
  filepath: 'http://fooo/s3.file.pdf',
  user_id: 2
};


//counter of keyWords

function attachToCluster(file) {

  //find all keyWords
  //create new keywords, or attach keywords to file
  //calc all keywords and all knowleges for Example: 

  //words:['AngularJS','programming','language'] Knowleges:['Web-Technologies','Programming]  
  //words:['Puasson','programming','Squere'] Knowleges:['Linerial algebra','Diffunctions']  

  // two ways, 

  // 1. based only on percent of  intersection
  // intersection keywords : 56%
  // intersection knowleges: 49%
  // sum intersection : 56+49 / 2 = 52.5 => add to cluster 
  // sum intersection :23+47 /2 = 35 => next cluster or create new

  // 2. based on square distance between cluster centroid and new result 
  //create intersection of keywords and knowleges, get result :
  // intersection keywords : 87
  // intersection knowleges : 13
  // centroid keywords : 122
  // centroid knowleges : 21
  // sum : sqrt ((122 - 87)^2 - (21-13)^2)> min elem dist

}



