import React from 'react';
import { ref, set } from 'firebase/database';
import { Drawer, Button, Divider } from 'rsuite';
import { useProfile } from '../../context/profile';
import { database } from '../../misc/firebase';
import ProviderBlock from './ProviderBlock';
import AvatarUploadBtn from './AvatarUploadBtn';
import EditableInput from '../EditableInput';
// import { getUserUpdates } from '../../misc/helpers';
import { useAlert, TYPE } from '../../misc/Alert';


export default function Dashboard({ onSignOut }) {

  const { profile } = useProfile()
  const [alert] = useAlert()

  const onSave = async (newData) => {
    const userNameRef = ref(database, `/profiles/${profile.uid}/name`)
    
    try{
      await set(userNameRef, newData)
      alert('Nickname has been updated')
    }catch(err){
      alert(err.message, TYPE.ERROR)
    }
  }

  return <>
  <Drawer.Header>
    <Drawer.Title>Dashboard</Drawer.Title>
  </Drawer.Header>

  <Drawer.Body style={{padding: `30px 30px 0px`, margin: 0}}>
    <h4>Hey, {profile.name}</h4>
    <ProviderBlock />
    <Divider />
    <EditableInput
          name="nickname"
          initialValue={profile.name}
          onSave={onSave}
          label={<h6 className="mb-2">Nickname</h6>}
    />
    <AvatarUploadBtn />

    <Button color="red" appearance="primary" onClick={onSignOut}>
      Sign out
    </Button>
  </Drawer.Body>

</>
}
