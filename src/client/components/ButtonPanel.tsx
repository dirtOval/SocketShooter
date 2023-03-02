import React from 'react';

const ButtonPanel = ({setAppState}) => {

  return (
    <div className="button-panel">
      <div onClick={() => {
        setAppState('playing');
      }}><p>Create Match</p></div>
      <div><p>High Scores</p></div>
    </div>
  )
}

export default ButtonPanel;