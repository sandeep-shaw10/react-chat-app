import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { useParams } from 'react-router';
import { database, auth, storage } from '../../../misc/firebase';
import { transformToArrWithId, groupBy } from '../../../misc/helpers';
import MessageItem from './MessageItem';
import { query, ref, orderByChild, equalTo, onValue, runTransaction, update, limitToLast as lastLimit } from 'firebase/database';
import { useAlert, TYPE } from '../../../misc/Alert';
import {deleteObject, ref as storageRef} from 'firebase/storage'
import { Button } from 'rsuite';


const loadTime = {initCount: 0, display:true, messages: null}
function reducer(state, action) {
  switch (action.type) {
    case 'init':
      return {...state, initCount: action.value};
    case 'msg':
      return {...state, messages: action.data}
    case 'check':
        return {...state, display: false}
    default:
      return state
  }
}


const messagesRef = ref(database, 'messages');
const PAGE_SIZE = 15

function shouldScrollToBottom({scrollHeight, scrollTop, clientHeight}, threshold = 30) {
  const percentage = (100 * scrollTop) / (scrollHeight - clientHeight) || 0;
  return percentage > threshold;
}


const Messages = () => {

  const [{messages, initCount, display}, dispatch] = useReducer(reducer, loadTime);
  const [alert] = useAlert()
  const { chatId } = useParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  const checkLoad = (message) => {
    if(message){
      dispatch({type: 'init', value: message.length})
      if(initCount === messages.length){
        dispatch({type: 'check'})
      }
    }
    return true
  }

  const loadMessages = useCallback( limitToLast => {
    const node = selfRef.current
    const queryRef = query(messagesRef, orderByChild('roomId'), equalTo(chatId), lastLimit(limitToLast || PAGE_SIZE))
    const unSub = onValue(queryRef, (snap) => {
      const data = transformToArrWithId(snap.val());
      dispatch({type: 'msg', data})
      if(shouldScrollToBottom(node)){
        node.scrollTop = node.scrollHeight
      }
      setLimit(p => p + PAGE_SIZE)
    }, error => {
      alert(error.message, TYPE.ERROR)
    })
    return unSub
  }, [chatId])


  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 200);

  }, [loadMessages, limit]);


  useEffect(() => {
    const node = selfRef.current;
    const unSub = loadMessages()
    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);
    return () => unSub();
  }, [loadMessages]);


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
    async (msgId, file) => {
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

      if (file) {
        try {
          const fileRef = storageRef(storage, `chat/${chatId}/${file.name}`)
          deleteObject(fileRef)
        } catch (err) {
          alert(err.message, TYPE.ERROR);
        }
      }
    },
    [chatId, messages]
  );


  const renderMessages = () => {
    const groups = groupBy(messages, item =>
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach(date => {
      items.push(
        <li key={date} className="text-center mb-1 padded">
          {date}
        </li>
      );

      const msgs = groups[date].map(msg => (
        <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} handleDelete={handleDelete}/>
      ));

      items.push(...msgs);
    });

    return items;
  };

  
  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
    {display && messages && messages.length >= PAGE_SIZE && (
      <li className="text-center mt-2 mb-2" onClick={() => checkLoad(messages)}>
        <Button onClick={onLoadMore} color="green" appearance='primary'>
          Load more
        </Button>
      </li>
    )}
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Messages;