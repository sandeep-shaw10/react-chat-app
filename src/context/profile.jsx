import React, {createContext, useReducer, useEffect} from 'react'
import { useContext } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../misc/firebase';
import { onValue, ref, off } from 'firebase/database';


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

const ProfileContext = createContext();


export default function ProfileProvider({ children }) {
    const [{isLoading, profile}, dispatch] = useReducer(reducer, initialState)
    
    useEffect(() => {

        let dbRef;

        const authUnsub = onAuthStateChanged(auth, (authObj) => {
            if(authObj){
                dbRef = ref(database, `/profiles/${authObj.uid}`)
                onValue(dbRef, (snap) => {
                    const {name, createdAt, avatar} = snap.val()
                    const data = {
                        name, createdAt, avatar,
                        uid: authObj.uid,
                        email: authObj.email
                    }
                    dispatch({type:'SUCCESS', data})
                })
            }
            // Not sign in
            else{
                if(dbRef){ off(dbRef) }
                dispatch({type:'ERROR'})
            }
        })

        // unmount
        return () => {
            authUnsub()
            if(dbRef){ dbRef.off() }
        }
    }, [])

    return (
        <ProfileContext.Provider value={{ isLoading, profile }}>
        {children}
        </ProfileContext.Provider>
    )
}


export const useProfile = () => useContext(ProfileContext)