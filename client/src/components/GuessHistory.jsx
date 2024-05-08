import React from "react";

function GuessHistory({ results }) {
  return (
    <div>
      {results.map((x, i) => (
        <div key={i}>
          You guess {x.guess}, {x.num} correct numbers, {x.loc} correct
          locations
        </div>
      ))}
    </div>
  );
}

export default GuessHistory;
