import React, { useState, useCallback } from 'react'
import { InputGroup, Input } from 'rsuite'
import SendIcon from '@rsuite/icons/Send'
import { useParams } from 'react-router'
import { useProfile } from '../../../context/profile'
import { database } from '../../../misc/firebase'
import { useAlert, TYPE } from '../../../misc/Alert'
import { ref, child, push, update, serverTimestamp } from 'firebase/database'
import AttachmentBtnModal from './AttachmentBtnModal';



function assembleMessage(profile, chatId) {
  return {
    roomId: chatId,
    author: {
      name: profile.name,
      uid: profile.uid,
      createdAt: profile.createdAt,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
    createdAt: serverTimestamp(),
    likeCount: 0,
  }
}


const Bottom = () => {

  const [alert] = useAlert()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { chatId } = useParams()
  const { profile } = useProfile()

  const onSendClick = async () => {

    if (input.trim() === '') { return }

    const msgData = assembleMessage(profile, chatId)
    const updates = {}
    const messageId = push(child(ref(database), 'messages')).key

    msgData.text = input
    updates[`/messages/${messageId}`] = msgData
    updates[`/rooms/${chatId}/lastMessage`] = {
      ...msgData,
      msgId: messageId,
    }

    setIsLoading(true)
    try {
      await update(ref(database),updates)
      setInput('')
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      alert(err.message, TYPE.ERROR)
    }

  }

  const onInputChange = useCallback(value => {
    setInput(value)
  }, [])

  const onKeyDown = ev => {
    if (ev.keyCode === 13) {
      ev.preventDefault()
      onSendClick()
    }
  }

  const afterUpload = useCallback(
    async files => {
      setIsLoading(true);
      const updates = {};
      files.forEach(file => {
        const msgData = assembleMessage(profile, chatId);
        msgData.file = file;
        const messageId = push(ref(database, 'messages')).key;
        updates[`/messages/${messageId}`] = msgData;
      });

      const lastMsgId = Object.keys(updates).pop();

      updates[`/rooms/${chatId}/lastMessage`] = {
        ...updates[lastMsgId],
        msgId: lastMsgId,
      };

      try {
        await update(ref(database), updates);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        alert(err.message, TYPE.ERROR);
      }
    },
    [chatId, profile]
  );

  return (
    <div>
      <InputGroup>
      <AttachmentBtnModal afterUpload={afterUpload} />
        <Input
          placeholder="Write a new message here..."
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />

        <InputGroup.Button
          color="blue"
          appearance="primary"
          onClick={onSendClick}
          disabled={isLoading}
        >
          <SendIcon/>
        </InputGroup.Button>
      </InputGroup>
    </div>
  )
}

export default Bottom