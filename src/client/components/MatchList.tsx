import React from 'react';
import Match from './Match';

const MatchList = ({rooms, setAppState, setActiveRoomId}) => {

  const handleClick = (roomId) => {
    setActiveRoomId(roomId);
    setAppState('playing');
  }
  return (
    <div className="match-list">
      <h3>Matches:</h3>
      {rooms.map(room => (
        <Match room={room} key={room.processId} handleClick={handleClick}/>
      ))}
    </div>
  )
}

export default MatchList;