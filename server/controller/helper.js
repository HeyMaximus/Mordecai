const axios = require("axios");

async function genAnswer(difficulty) {
  try {
    const genAnswerUrl =
      process.env.GEN_URL || "https://www.random.org/integers";
    const ansParams = {
      params: {
        num: difficulty,
        min: 0,
        max: 7,
        col: 1,
        base: 10,
        format: "plain",
        rnd: "new",
      },
    };
    const answer = await axios.get(genAnswerUrl, ansParams);
    let answerStr = answer.data.split("\n");
    answerStr.pop();
    answerStr = answerStr.join("");
    return await answerStr;
  } catch (error) {
    console.log("genAnswer error: ", error);
  }
}

function analyzeGuess(guess, answer) {
  let correctLoc = 0;
  let correctNum = 0;
  let remainders = [];
  let freqMap = new Array(8);

  for (var i = 0; i < guess.length; i++) {
    const answerNum = Number(answer[i]);
    const guessNum = guess[i];

    if (guessNum === answerNum) {
      correctLoc += 1;
    } else {
      freqMap[answerNum] = freqMap[answerNum] ? (freqMap[answerNum] + 1) : 1;
      remainders.push(guessNum);
    }
  }

  for (var j = 0; j < remainders.length; j++) {
    if (freqMap[remainders[j]] > 0) {
      correctNum += 1;
      freqMap[remainders[j]] -= 1;
    }
  }
  correctNum = correctNum + correctLoc;
  return { correctNum, correctLoc };
}

function createHint(answer) {
  const first = Number(answer[0]);
  const last = Number(answer[answer.length - 1]);
  const total = answer
    .split("")
    .map((x) => parseInt(x))
    .reduce((accu, curr) => accu + curr, 0);
  return { first, last, total };
}

module.exports = { analyzeGuess, createHint, genAnswer };
