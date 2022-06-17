import { useCallback, useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "./firebase";


export function useModalState(defaultVal = false) {
    const [isOpen, setIsOpen] = useState(defaultVal)
    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    return { isOpen, open, close }
}


export const useMediaQuery = query => {
    const [matches, setMatches] = useState(
      () => window.matchMedia(query).matches
    );
  
    useEffect(() => {
      const queryList = window.matchMedia(query);
      setMatches(queryList.matches);
      const listener = evt => setMatches(evt.matches);
      queryList.addListener(listener);
      return () => queryList.removeListener(listener);
    }, [query]);
  
    return matches;
};


export function usePresence(uid) {
  const [presence, setPresence] = useState(null);

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${uid}`);

    const userListner = onValue(userStatusRef, (snap) => {
      if(snap.exists()){
        const data = snap.val()
        setPresence(data)
      }
    })

    return () => { userListner() };
  }, [uid]);

  return presence;
}