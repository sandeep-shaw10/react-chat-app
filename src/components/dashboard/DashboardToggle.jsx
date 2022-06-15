import React, { useCallback } from 'react';
import { Button, Drawer } from 'rsuite';
import DashboardIcon from '@rsuite/icons/Dashboard';
// import { ref, set } from 'firebase/database';
import { useModalState, useMediaQuery } from '../../misc/custom-hooks';
import Dashboard from '.';
import { signOut } from 'firebase/auth';
import { auth, database } from '../../misc/firebase';
import { useAlert, TYPE } from '../../misc/Alert'
// import { isOfflineForDatabase } from '../../context/profile.context';



const DashboardToggle = () => {
  const { isOpen, close, open } = useModalState();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [alert] = useAlert()
  const onSignOut = useCallback(() => {
    signOut(auth).then(() => {
      alert('Signed Out')
      close()
    }).catch((err) => {
      alert(`Failed: ${err}`, TYPE.ERROR)
    })
  }, [close])

//   const onSignOut = useCallback(() => {
//     set(ref(database, `/status/${auth.currentUser.uid}`), isOfflineForDatabase)
//       .then(() => {
//         auth.signOut();
//         Alert.info('Signed out', 4000);
//         close();
//       })
//       .catch(err => {
//         Alert.error(err.message, 4000);
//       });
//   }, [close]);

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