import React from "react";

function HighScores({ highScores }) {
  return (
    <div>
      {highScores.map((x, i) => (
        <div key={i}>
          {i + 1}: User: {x.username} using {x.attempts} attempts.
        </div>
      ))}
    </div>
  );
}

export default HighScores;
