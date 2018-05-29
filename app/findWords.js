const _ = require('lodash');
var uwords = require('uwords');
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


function chastrechiRUS(words) {

  /*
  Группы окончаний:
  1. прилагательные
  2. причастие
  3. глагол
  4. существительное
  5. наречие
  6. числительное
  7. союз
  8. предлог
 */

  const groups = {
    adjective: ['ее', 'ие', 'ые', 'ое', 'ими', 'ыми', 'ей', 'ий', 'ый', 'ой', 'ем', 'им', 'ым', 'ом',
      'его', 'ого', 'ему', 'ому', 'их', 'ых', 'ую', 'юю', 'ая', 'яя', 'ою', 'ею'],
    participle: ['ивш', 'ывш', 'ующ', 'ем', 'нн', 'вш', 'ющ', 'ущи', 'ющи', 'ящий', 'щих', 'щие', 'ляя'],
    verb: ['ила', 'ыла', 'ена', 'ейте', 'уйте', 'ите', 'или', 'ыли', 'ей', 'уй', 'ил', 'ыл', 'им', 'ым', 'ен',
      'ило', 'ыло', 'ено', 'ят', 'ует', 'уют', 'ит', 'ыт', 'ены', 'ить', 'ыть', 'ишь', 'ую', 'ю', 'ла', 'на', 'ете', 'йте',
      'ли', 'й', 'л', 'ем', 'н', 'ло', 'ет', 'ют', 'ны', 'ть', 'ешь', 'нно'],
    noun: ['а', 'ев', 'ов', 'ье', 'иями', 'ями', 'ами', 'еи', 'ии', 'и', 'ией', 'ей', 'ой', 'ий', 'й', 'иям', 'ям', 'ием', 'ем',
      'ам', 'ом', 'о', 'у', 'ах', 'иях', 'ях', 'ы', 'ь', 'ию', 'ью', 'ю', 'ия', 'ья', 'я', 'ок', 'мва', 'яна', 'ровать', 'ег', 'ги', 'га', 'сть', 'сти'],
    adverb: ['чно', 'еко', 'соко', 'боко', 'роко', 'имо', 'мно', 'жно', 'жко', 'ело', 'тно', 'льно', 'здо', 'зко', 'шо', 'хо', 'но'],
    numeral: ['чуть', 'много', 'мало', 'еро', 'вое', 'рое', 'еро', 'сти', 'одной', 'двух', 'рех', 'еми', 'яти', 'ьми', 'ати',
      'дного', 'сто', 'ста', 'тысяча', 'тысячи', 'две', 'три', 'одна', 'умя', 'тью', 'мя', 'тью', 'мью', 'тью', 'одним'],
    alliance: ['более', 'менее', 'очень', 'крайне', 'скоре', 'некотор', 'кажд', 'други', 'котор', 'когд', 'однак',
      'если', 'чтоб', 'хот', 'смотря', 'как', 'также', 'так', 'зато', 'что', 'или', 'потом', 'эт', 'тог', 'тоже', 'словно',
      'ежели', 'кабы', 'коли', 'ничем', 'чем'],
    preposition: ['в', 'на', 'по', 'из']
  }
  let res = [];


  _.forEach(words, (word, word_index) => {
    const wordLenght = word.length;
    let groupIndex = 0;
    _.forIn(groups, (group, groupName) => {
      _.forEach(group, part => {
        const partLength = part.length;
        res[word_index] = res[word_index] ? res[word_index] : [];
        if (
          word.substring(wordLenght - partLength, wordLenght) == part  //любая часть речи, окончания
          || word.indexOf(part) >= (Math.round(2 * wordLenght) / 5) && groupIndex == 2 //причастие, от 40% и правее от длины слова
          || word.substring(0, partLength) == part && res[word_index][groupIndex] < partLength && groupIndex == 7 //союз, сначала слОва
          || word == part //полное совпадение
        ) {
          if (word != part) res[word_index][groupIndex] = partLength; else res[word_index][groupIndex] = 99;
        }
        else {
          console.log('FOOO', word.substring(wordLenght - partLength, wordLenght))
        }
      });
      if (!(res[word_index][groupIndex])) res[word_index][groupIndex] = 0;
      groupIndex++;
    });
  });


  let result = [];
  _.forEach(res, r => {
    let sorted = _.reverse(r);
    result.push()
  }) {
    arsort($r);
    array_push($result, key($r));
  }
  return $result;
}

console.log('Results', res);


  // $res = array();
  // $string = mb_strtolower($string);
  // $words = explode(' ', $string);
  // //print_r($words);
  // foreach($words as $wk=> $w){
  //   $len_w = mb_strlen($w);
  //   foreach($groups as $gk=> $g){
  //     foreach($g as $part){
  //       $len_part = mb_strlen($part);
  //       if (
  //         mb_substr($w, -$len_part) == $part && $res[$wk][$gk] < $len_part //любая часть речи, окончания
  //         || mb_strpos($w, $part) >= (round(2 * $len_w) / 5) && $gk == 2 //причастие, от 40% и правее от длины слова
  //         || mb_substr($w, 0, $len_part) == $part && $res[$wk][$gk] < $len_part && $gk == 7 //союз, сначала слОва
  //         || $w == $part //полное совпадение
  //       ) {
  //         //echo $w.':'.$part."(".$gk.")<br>";
  //         if ($w != $part) $res[$wk][$gk] = mb_strlen($part); else $res[$wk][$gk] = 99;
  //       }

  //     }
  //   }
  //   if (!isset($res[$wk][$gk])) $res[$wk][$gk] = 0;
  //   //echo "<hr>";
  // }


  // $result = array();
  // foreach($res as $r) {
  //   arsort($r);
  //   array_push($result, key($r));
  // }
  // return $result;
}




let words = uwords('Если мы посмотрим на новые обновления, мы увидим насколько важен данный код для AngularJS.');
console.log('words', words);
chastrechiRUS(words);