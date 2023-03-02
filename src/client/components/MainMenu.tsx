import React from 'react';
import MatchList from './MatchList';
import ButtonPanel from './ButtonPanel';

const MainMenu = ({rooms, setAppState, setActiveRoomId}) => {

  return (
    <div className="main">
      <h1>SocketShooter</h1>
      <p>Click on a match to join, or create a new one!</p>
      <div className="menu">
        <MatchList rooms={rooms}
                  setAppState={setAppState}
                  setActiveRoomId={setActiveRoomId}/>
        <ButtonPanel setAppState={setAppState}/>
      </div>
    </div>
  )
}

export default MainMenu;