import React from 'react';
import MatchList from './MatchList';
import ButtonPanel from './ButtonPanel';

const MainMenu = ({rooms, setAppState, setActiveRoomId}) => {

  return (
    <>
    <h1>SocketShooter</h1>
      <MatchList rooms={rooms}
                 setAppState={setAppState}
                 setActiveRoomId={setActiveRoomId}/>
      <ButtonPanel />
    </>
  )
}

export default MainMenu;