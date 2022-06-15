import React from 'react'
import { Container, Grid, Row, Panel, Col, Button } from 'rsuite';
import { Icon } from '@rsuite/icons';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { auth, database } from '../misc/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, getAdditionalUserInfo } from 'firebase/auth'
import { ref, set, serverTimestamp } from "firebase/database";
import {useAlert, TYPE} from '../misc/Alert';


export default function SignIn() {

  const [alert] = useAlert()

  const signInProvider = async (provider) => {
    try{
      const credential = await signInWithPopup(auth, provider);
      const userMeta = getAdditionalUserInfo(credential);
      if (userMeta.isNewUser) {
        await set(ref(database, `/profiles/${credential.user.uid}`), {
          name: credential.user.displayName,
          createdAt: serverTimestamp(),
        });
      }
      alert('Signed In')
    }catch(err){
      alert('Failed to Sign In', TYPE.ERROR)
    }
  }

  const onFacebookSignIn = () => {
    signInProvider(new FacebookAuthProvider());
  };

  const onGoogleSignIn = () => {
    const provider = new GoogleAuthProvider()
    signInProvider(provider);
  };


  return (
    <Container>
      <Grid className="mt-page">
        <Row>
          <Col xs={24} md={12} mdOffset={6}>
            <Panel>
              <div className="text-center">
                <h2>Welcome to Chat</h2>
                <p>Progressive chat platform for neophytes</p>
              </div>

              <div className="mt-3">
                <Button block color="blue" appearance="primary" onClick={onFacebookSignIn}>
                  <Icon as={FaFacebook} />  Continue with Facebook
                </Button>

                <Button block color="green" appearance="primary" onClick={onGoogleSignIn}>
                  <Icon as={FaGoogle} /> Continue with Google
                </Button>
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>
    </Container>
  )
}
