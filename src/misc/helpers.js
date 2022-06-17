import { ref, query, orderByChild, equalTo, onValue, get } from "firebase/database";


export function getNameInitials(name) {
    const splitName = name.toUpperCase().split(' ');
  
    if (splitName.length > 1) {
      return splitName[0][0] + splitName[1][0];
    }
  
    return splitName[0][0];
  }

export function transformToArr(snapVal) {
  return snapVal ? Object.keys(snapVal) : [];
}

export function transformToArrWithId(snapVal) {
  return snapVal ? Object.keys(snapVal).map(roomId => {
    return { ...snapVal[roomId], id: roomId };
  }) : [];
}

export async function getUserUpdates(userId, keyToUpdate, value, db) {
  const updates = {};

  updates[`/profiles/${userId}/${keyToUpdate}`] = value;

  console.table(userId, keyToUpdate, value)
  const getMsgs = query(ref(db, 'messages'), orderByChild('author/uid'), equalTo(userId))
  const getRooms = query(ref(db, 'rooms'), orderByChild('lastMessage/author/uid'), equalTo(userId))


  const [mSnap, rSnap] = await Promise.all([get(getMsgs), get(getRooms)]);


  mSnap.forEach(msgSnap => {
    updates[`/messages/${msgSnap.key}/author/${keyToUpdate}`] = value;
  });

  rSnap.forEach(roomSnap => {
    updates[`/rooms/${roomSnap.key}/lastMessage/author/${keyToUpdate}`] = value;
  });

  return updates;
}