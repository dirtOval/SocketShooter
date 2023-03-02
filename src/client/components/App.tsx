import React from 'react';
import {useEffect, useState} from 'react';
import {GameView} from './Game';
import MainMenu from './MainMenu';
import {client} from '../utility/Client';
import '../styles.css';

const App = (props) => {

  const [rooms, setRooms] = useState([]);
  const [appState, setAppState] = useState('menu')
  const [activeRoomId, setActiveRoomId] = useState('');

  useEffect( () => {
    client.getAvailableRooms()
      .then(rooms => {
        setRooms(rooms);
      })
      .catch(err => {
        console.log(err);
      })
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
    <div className="app">
    {appState === 'menu' && <MainMenu rooms={rooms}
                                      setAppState={setAppState}
                                      setActiveRoomId={setActiveRoomId}/>}

    {appState === 'playing' && <GameView activeRoomId={activeRoomId}/>}
    </div>
  )
}

export default App;