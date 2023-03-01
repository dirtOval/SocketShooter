import React from 'react';
import {useEffect, useState} from 'react';
import {GameView} from './Game';
import MainMenu from './MainMenu';
import {client} from '../utility/Client';

const App = (props) => {

  const [rooms, setRooms] = useState([]);
  const [appState, setAppState] = useState('menu')
  const [activeRoomId, setActiveRoomId] = useState('');

  useEffect( () => {
    setInterval(() => {
      client.getAvailableRooms()
      .then(rooms => {
        setRooms(rooms);
      })
      .catch(err => {
        console.log(err);
      })
    }, 3000)
  }, [])

  return (
    <>
    {appState === 'menu' && <MainMenu rooms={rooms}
                                      setAppState={setAppState}
                                      setActiveRoomId={setActiveRoomId}/>}
    {appState === 'playing' && <GameView activeRoomId={activeRoomId}/>}
    </>
  )
}

export default App;