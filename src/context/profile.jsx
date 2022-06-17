import React, {createContext, useReducer, useEffect} from 'react'
import { useContext } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../misc/firebase';
import { onDisconnect, onValue, ref, serverTimestamp, set, off } from 'firebase/database';

// Reducer ------
const initialState = {profile: null, isLoading: true}

function reducer(state, action){
    switch(action.type){
        case 'SUCCESS': {
            return { profile: action.data, isLoading: false}
        }
        case 'ERROR': {
            return { profile: null, isLoading: false }
        }
        default: {
            return state
        }
    }
}
// Reducer ------


// Function -----
export const isOfflineForDatabase = {
    state: 'offline',
    last_changed: serverTimestamp(),
  };
  
const isOnlineForDatabase = {
    state: 'online',
    last_changed: serverTimestamp(),
};
// Function -----


const ProfileContext = createContext();


export default function ProfileProvider({ children }) {
    const [{isLoading, profile}, dispatch] = useReducer(reducer, initialState)
    
    useEffect(() => {

        let dbRef;
        let userStatusRef;
        let dbListener;
        let userInfoListener;

        const authUnsub = onAuthStateChanged(auth, (authObj) => {
            if(authObj){
                userStatusRef = ref(database, `/status/${authObj.uid}`)
                dbRef = ref(database, `/profiles/${authObj.uid}`)
                
                dbListener = onValue(dbRef, (snap) => {
                    const {name, createdAt, avatar} = snap.val()
                    const data = {
                        name, createdAt, avatar,
                        uid: authObj.uid,
                        email: authObj.email
                    }
                    dispatch({type:'SUCCESS', data})
                })

                //https://firebase.google.com/docs/database/web/offline-capabilities#web-version-9_6
                userInfoListener = onValue(ref(database, '.info/connected'),snap => {
                    if(snap.val() === false) return
                    onDisconnect(userStatusRef).set(isOfflineForDatabase).then(()=>{
                        set(userStatusRef,isOnlineForDatabase)
                    })
                })
            }
            // Not sign in
            else{
                if(dbRef){ dbListener() }
                if(userStatusRef){ off(userStatusRef) }
                if(userInfoListener){ userInfoListener() }
                dispatch({type:'ERROR'})
            }
        })

        // unmount
        return () => {
            authUnsub()
            if(userInfoListener){ userInfoListener() }
            if(dbRef){ return dbListener() }
            if(userStatusRef){ off(userStatusRef) }
        }
    }, [])

    return (
        <ProfileContext.Provider value={{ isLoading, profile }}>
        {children}
        </ProfileContext.Provider>
    )
}


export const useProfile = () => useContext(ProfileContext)