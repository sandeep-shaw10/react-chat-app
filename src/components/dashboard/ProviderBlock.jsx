import React, { useState } from 'react';
import { Tag, Button } from 'rsuite';
import { Icon } from '@rsuite/icons';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { FacebookAuthProvider, GoogleAuthProvider, linkWithPopup, unlink} from 'firebase/auth';
import { auth } from '../../misc/firebase';
import { useAlert, TYPE } from '../../misc/Alert';


const ProviderBlock = () => {

    const [alert] = useAlert()

  const [isConnected, setIsConnected] = useState({
    'google.com': auth.currentUser.providerData.some(
      data => data.providerId === 'google.com'
    ),
    'facebook.com': auth.currentUser.providerData.some(
      data => data.providerId === 'facebook.com'
    ),
  });

  const updateIsConnected = (providerId, value) => {
    setIsConnected(p => {
      return {
        ...p,
        [providerId]: value,
      };
    });
  };

  const unlinkProvider = async providerId => {
    try {
      if (auth.currentUser.providerData.length === 1) {
        throw new Error(`You can not disconnect from ${providerId}`);
      }

      await unlink(auth.currentUser, providerId);
      updateIsConnected(providerId, false);
      alert(`Disconnected from ${providerId}`);
    } catch (err) {
        alert(err.message, TYPE.ERROR);
    }
  };

  const unlinkFacebook = () => {
    unlinkProvider('facebook.com');
  };
  const unlinkGoogle = () => {
    unlinkProvider('google.com');
  };

  const linkProvider = async provider => {
    try {
      await linkWithPopup(auth.currentUser, provider);
      alert(`Linked to ${provider.providerId}`);
      updateIsConnected(provider.providerId, true);
    } catch (err) {
      alert(err.message, TYPE.ERROR);
    }
  };

  const linkFacebook = () => {
    linkProvider(new FacebookAuthProvider());
  };
  const linkGoogle = () => {
    linkProvider(new GoogleAuthProvider());
  };

  return (
    <div>
      {isConnected['google.com'] && (
        <Tag color="green" closable onClose={unlinkGoogle}>
          <Icon as={FaGoogle} /> Connected
        </Tag>
      )}
      {isConnected['facebook.com'] && (
        <Tag color="blue" closable onClose={unlinkFacebook}>
          <Icon as={FaFacebook} /> Connected
        </Tag>
      )}

      <div className="mt-2">
        {!isConnected['google.com'] && (
          <Button block appearance='primary' color="green" onClick={linkGoogle}>
            <Icon as={FaGoogle} /> Link to Google
          </Button>
        )}

        {!isConnected['facebook.com'] && (
          <Button block appearance='primary' color="blue" onClick={linkFacebook}>
            <Icon as={FaFacebook} /> Link to Facebook
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProviderBlock;