import React, { useState, useEffect, createContext } from "react";

function GuessHistory({results}) {

  return (
    <div>
      {results.map((x, i) => (<div>You guess {x.guess}, {x.num} correct numbers, {x.loc} correct locations</div>))}
    </div>
  );
}

export default GuessHistory;