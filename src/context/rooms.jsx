import { onValue } from 'firebase/database';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../misc/firebase';
import { transformToArrWithId } from '../misc/helpers';
import { ref } from 'firebase/database';


const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState(null);

  useEffect(() => {
    const roomListRef = ref(database, 'rooms');
    const listener = onValue(roomListRef, (snap) => {
        const data = transformToArrWithId(snap.val());
        setRooms(data);
    })

    return () => listener();
  }, []);

  return (
    <RoomsContext.Provider value={rooms}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);