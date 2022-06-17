import React, { useCallback } from 'react';
import { Button, Drawer } from 'rsuite';
import DashboardIcon from '@rsuite/icons/Dashboard';
import { ref, set } from 'firebase/database';
import { useModalState, useMediaQuery } from '../../misc/custom-hooks';
import Dashboard from '.';
import { signOut } from 'firebase/auth';
import { auth, database } from '../../misc/firebase';
import { useAlert, TYPE } from '../../misc/Alert'
import { isOfflineForDatabase } from '../../context/profile';



const DashboardToggle = () => {
  const { isOpen, close, open } = useModalState();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [alert] = useAlert()

  const onSignOut = useCallback(() => {
    const dbRef = ref(database, `/status/${auth.currentUser.uid}`)
    set(dbRef, isOfflineForDatabase).then(()=>{
      signOut(auth).then(() => {
        alert('Signed Out')
      })
    }).catch((err) => {
      alert(`Failed: ${err}`, TYPE.ERROR)
    })
  }, [close])


  return (
    <>
      <Button block color="blue" appearance='primary' onClick={open}>
      <DashboardIcon/> Dashboard
      </Button>
      <Drawer size={isMobile ? 'full': 'sm'} open={isOpen} onClose={close} placement="left">
        <Dashboard onSignOut={onSignOut} />
      </Drawer>
    </>
  );
};

export default DashboardToggle;