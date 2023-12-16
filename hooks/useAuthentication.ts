import React from 'react';
import { app } from '../firebase/firebase'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const auth = getAuth(app);

export function useAuthentication() {
  const [user, setUser] = React.useState<User>();
  const [loading, setLoading] = React.useState(true);  // Add a loading state

  React.useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
      setLoading(false);  // Set loading to false after receiving the user's authentication state
    });

    return unsubscribeFromAuthStatusChanged;
  }, []);

  return {
    user,
    loading,  // Return the loading state
  };
}