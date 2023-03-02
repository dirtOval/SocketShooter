import React from 'react';

const ButtonPanel = ({setAppState}) => {

  return (
    <>
      <button onClick={() => {
        setAppState('playing');
      }}>Create Match</button>
      <button>High Scores</button>
    </>
  )
}

export default ButtonPanel;