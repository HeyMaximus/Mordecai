const axios = require('axios');

function parseGenAnswer(ans) {

}

function genAnswer(difficulty) {
  const genAnswerUrl = process.env.GEN_URL;
  const ansParams = {
    params: {
      nums: difficulty,
      min: 0,
      max: 7,
      col: 1,
      base: 10,
      format: 'plain',
      rnd: 'new'
    }
  };

}


function analyzeGuess(guess, answer) {
  let correctLoc = 0;
  let correctNum = 0;
  let remainders = [];
  let freqMap = new Array(8);

  for (var i = 0; i < guess.length; i++) {
    let answerNum = Number(answer[i])
    if (guess[i] === answerNum) {
      console.log('this is guess[i]: ', guess[i])
      console.log('this is answerNum: ', answerNum)
      correctLoc += 1;
    } else {
      freqMap[answerNum] = freqMap[answerNum] ? freqMap[answerNum] += 1 : 1;
      remainders.push(guess[i]);
    }
  }
  for (var j = 0; j < remainders.length; j++) {
    if (freqMap[remainders[i]] > 0) {
      correctNum += 1;
      freqMap[remainders[i]] -= 1;
    }
  }
  correctNum = correctNum + correctLoc;
  return { correctNum, correctLoc }
}

module.exports = { genAnswer, analyzeGuess }