import React, {createContext, useReducer, useEffect} from 'react'
import { useContext } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from '../misc/firebase';
import { onValue, ref } from 'firebase/database';


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
        let dbListener;

        const authUnsub = onAuthStateChanged(auth, (authObj) => {
            if(authObj){
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
            }
            // Not sign in
            else{
                if(dbRef){ dbListener() }
                dispatch({type:'ERROR'})
            }
        })

        // unmount
        return () => {
            authUnsub()
            if(dbRef){ return dbListener() }
        }
    }, [])

    return (
        <ProfileContext.Provider value={{ isLoading, profile }}>
        {children}
        </ProfileContext.Provider>
    )
}


export const useProfile = () => useContext(ProfileContext)