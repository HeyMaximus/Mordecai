import React from "react";

function CoderView({ socketMsg, tellTruth, tellLie, endGame }) {
  return (
    <div>
      {socketMsg.map((x, i) => (
        <div key={i}>{x}</div>
      ))}
      <button onClick={(e) => tellTruth(e)}>Tell Truth</button>
      {!endGame ? <button onClick={(e) => tellLie(e)}>Lie</button> : null}
    </div>
  );
}

export default CoderView;
