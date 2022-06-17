import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { database, auth } from '../../../misc/firebase';
import { transformToArrWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';
import { query, ref, orderByChild, equalTo, onValue, runTransaction, update } from 'firebase/database';
import { useAlert, TYPE } from '../../../misc/Alert';


const Messages = () => {

  const [alert] = useAlert()
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {

    const messagesRef = ref(database, 'messages');
    const queryRef = query(messagesRef, orderByChild('roomId'), equalTo(chatId))
    const unSub = onValue(queryRef, (snap) => {
        const data = transformToArrWithId(snap.val());
        setMessages(data)
    }, error => {
      console.log(error)
    })
    return () => unSub();
  }, [chatId]);


  const handleAdmin = useCallback(
    async uid => {
      const adminsRef = ref(database, `/rooms/${chatId}/admins`);
      let alertMsg;
      runTransaction(adminsRef, (admins) => {
        if(admins){
          if (admins[uid]) {
            admins[uid] = null;
            alertMsg = 'Admin permission removed';
          } else {
            admins[uid] = true;
            alertMsg = 'Admin permission granted';
          }
        }
        return admins;
      })
      alert(alertMsg);
    },
    [chatId]
  );


  const handleLike = useCallback(
    async msgId => {
      const { uid } = auth.currentUser;
      const messageRef = ref(database, `/messages/${msgId}`);
      let alertMsg;
      runTransaction(messageRef, (msg) => {
        if (msg) {
          msg.likeCount = (msg.likeCount === undefined)?0:msg.likeCount
          if (msg.likes && msg.likes[uid]) {    // Unlike
            msg.likeCount -= 1;
            msg.likes[uid] = null;
            alertMsg = 'Like removed';
          } else {                              // Like
            msg.likeCount += 1;
            if (!msg.likes) { msg.likes = {}; }
            msg.likes[uid] = true;
            alertMsg = 'Like added';
          }
        }
        return msg;
      })
      alert(alertMsg);
  }, []);


  const handleDelete = useCallback(
    async msgId => {
      if (!window.confirm('Delete this message?')) return

      const isLast = messages[messages.length - 1].id === msgId;
      const updates = {};
      updates[`/messages/${msgId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await update(ref(database), updates)
        alert('Message has been deleted', TYPE.SUCCESS);
      } catch (err) {
        alert(err.message, TYPE.ERROR);
      }
    },
    [chatId, messages]
  );

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages &&
        messages.map(msg => (
        <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} handleDelete={handleDelete} />
      ))}
    </ul>
  );
};

export default Messages;