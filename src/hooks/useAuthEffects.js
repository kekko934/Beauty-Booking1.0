
import React, { useEffect, useRef } from 'react';
import { AuthActionTypes } from '@/reducers/authReducer';

export const useAuthEffects = (dispatch, initializeAuthListenerFactory) => {
  const initializeAuthListenerRef = useRef(initializeAuthListenerFactory);

  useEffect(() => {
    let isMounted = true;
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });

    const onAuthStateChangeCallback = (user, isAdmin, loadingStatus) => {
      if (isMounted) {
        dispatch({ 
          type: AuthActionTypes.INITIALIZE_AUTH, 
          payload: { user, isAdmin, loading: loadingStatus }
        });
      }
    };
    
    // Get the initializeAuthListener function from the ref
    const initializeAuthListener = initializeAuthListenerRef.current;
    const { unsubscribe } = initializeAuthListener(onAuthStateChangeCallback);
    
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch]); // Removed initializeAuthListenerFactory from dependencies
};
  