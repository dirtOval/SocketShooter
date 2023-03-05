import React from 'react';

const Match = ({room, handleClick}) => {
  console.log(room.roomId);
  return (
    <div className="match" onClick={() => {
      handleClick(room.roomId);
    }}>
      <h2>Deathmatch</h2>
      {room.maxClients ? <h3>{room.clients}/{room.maxClients} Players</h3> :
                         <h3>{room.clients} Players</h3>}

    </div>
  )
}

export default Match;