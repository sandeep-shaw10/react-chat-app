import React, { useState, useRef } from "react"
import { Modal, Button } from "rsuite"
import { useModalState } from "../../misc/custom-hooks"
import { useProfile } from "../../context/profile"
import ProfileAvatar from "../ProfileAvatar"
import { useAlert, TYPE } from "../../misc/Alert"
import { ref as dbRef, set } from 'firebase/database';
import { storage, database } from '../../misc/firebase';
import { getDownloadURL, ref as storageRef, uploadBytes} from 'firebase/storage';
import AvatarEditor from 'react-avatar-editor';


const fileInputTypes = ".png, .jpeg, .jpg"
const acceptedFileTypes = ["image/png", "image/jpeg", "image/pjpeg"]
const isValidFile = (file) => acceptedFileTypes.includes(file.type)

const getBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("File process error"))
      }
    })
  })
}

export default function AvatarUploadBtn() {
  const { isOpen, open, close } = useModalState()
  const { profile } = useProfile()
  const [alert] = useAlert()
  const [img, setImg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const avatarEditorRef = useRef()

  const onFileInputChange = (ev) => {
    const currFiles = ev.target.files
    if (currFiles.length === 1) {
      const file = currFiles[0]

      if (isValidFile(file)) {
        setImg(file)

        open()
      } else {
        alert(`Wrong file type ${file.type}`, TYPE.WARNING)
      }
    }
  }


  const onUploadClick = async () => {
    const canvas = avatarEditorRef.current.getImageScaledToCanvas()

    setIsLoading(true)
    try {
      const blob = await getBlob(canvas)

      const avatarFileRef = storageRef(storage, `/profile/${profile.uid}/avatar`)

      await uploadBytes(avatarFileRef, blob, {
        cacheControl: `public, max-age=${3600 * 24 * 3}`,
      })

      const downloadUrl = await getDownloadURL(avatarFileRef)
      
      const userAvatarRef = dbRef(database, `/profiles/${profile.uid}/avatar`)
      set(userAvatarRef, downloadUrl)

      setIsLoading(false)
      alert('Avatar has been uploaded')
    } catch (err) {
      setIsLoading(false)
      console.log(err.message)
      alert(err.message, TYPE.ERROR)
    }
  }


  return (
    <div className="mt-3 text-center">
      <ProfileAvatar
        src={profile.avatar}
        name={profile.name} 
        className="width-200 height-200 img-fullsize font-huge"
      />

      <div>
        <label
          htmlFor="avatar-upload"
          className="d-block cursor-pointer padded"
        >
          Select new avatar
          <input
            id="avatar-upload"
            type="file"
            className="d-none"
            accept={fileInputTypes}
            onChange={onFileInputChange}
          />
        </label>

        <Modal open={isOpen} onClose={close}>
          <Modal.Header>
            <Modal.Title>Adjust and upload new avatar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center align-items-center h-100">
              {img && (
                <AvatarEditor
                  ref={avatarEditorRef}
                  image={img}
                  width={200}
                  height={200}
                  border={10}
                  borderRadius={100}
                  rotate={0}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              block
              appearance="ghost"
              onClick={onUploadClick}
              disabled={isLoading}
            >
              Upload new avatar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}
