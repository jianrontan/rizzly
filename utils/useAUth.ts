import React from 'react';
import { app } from '../../config/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const auth = getAuth(app);

export function useAuthentication() {
  const [user, setUser] = React.useState<User>();

  React.useEffect(() => {
    const unsubscribeFromAuthStatuChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
    });

    return unsubscribeFromAuthStatuChanged;
  }, []);

  return {
    user
  };
}