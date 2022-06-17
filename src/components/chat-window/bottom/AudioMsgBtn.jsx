import React, { useState, useCallback } from 'react';
import { InputGroup } from 'rsuite';
import { ReactMic } from 'react-mic';
import { useParams } from 'react-router-dom';
import { storage } from '../../../misc/firebase';
import { Icon } from '@rsuite/icons';
import { useAlert, TYPE } from "../../../misc/Alert";
import {getDownloadURL, ref as storageRef, uploadBytesResumable} from "firebase/storage"



const AudioSvg = React.forwardRef((props, ref) => (
<svg {...props} fill="currentColor" viewBox="0 0 352 512" height="1em" width="1em" ref={ref}>
    <path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 
    0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 
    7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 
    16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path>
</svg>
));


const AudioMsgBtn = ({ afterUpload }) => {
  const { chatId } = useParams();
    const [alert] = useAlert()
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onClick = useCallback(() => {
    setIsRecording(p => !p);
  }, []);

  const onUpload = useCallback( async(data) => {
      setIsUploading(true);
      try {

        const metaVal = { cacheControl: `public, max-age=${3600 * 24 * 3}`};
        const audioRef = storageRef(storage, `/chat/${chatId}/audio_${Date.now()}.mp3`)
        const snap = await uploadBytesResumable(audioRef, data.blob, metaVal)

        const file = {
          contentType: snap.metadata.contentType,
          name: snap.metadata.name,
          url: await getDownloadURL(snap.ref),
        };

        setIsUploading(false);
        afterUpload([file]);

      }catch (error){
        console.error(error)
        setIsUploading(false);
        alert(`in_${error.message}`, TYPE.ERROR);
      }
    },
    [afterUpload, chatId]
  );

  return (
    <InputGroup.Button
      onClick={onClick}
      disabled={isUploading}
      className={isRecording ? 'animate-blink' : ''}
    >
      <Icon as={AudioSvg} />
      <ReactMic
        record={isRecording}
        className="d-none"
        onStop={onUpload}
        mimeType="audio/mp3"
      />
    </InputGroup.Button>
  );
};

export default AudioMsgBtn;