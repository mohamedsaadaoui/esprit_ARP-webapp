import { useMemo, useState, useEffect } from "react";

import { decodeJwt } from "./decodeJwt";
import { AuthContext } from "./auth-context";
 
// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isLoading: true,
  });
 
  // Ajout d'un state pour forcer le re-render
  const [tokenVersion, setTokenVersion] = useState(0);
 
  const updateAuthState = () => {
    try {
      const token = sessionStorage.getItem('accessToken');
     
      if (token) {
        const decoded = decodeJwt(token);
        setState({
          user: {
            ...decoded,
            permissions: decoded.authorities || [],
          },
          isLoading: false
        });
      } else {
        setState({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, isLoading: false });
    }
  };
 
  useEffect(() => {
    // Écoute des changements dans le sessionStorage
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        setTokenVersion(v => v + 1); // Force le re-render
      }
    };
 
    window.addEventListener('storage', handleStorageChange);
   
    // Initial load
    updateAuthState();
 
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [tokenVersion]); // Dépendance à tokenVersion
 
  const value = useMemo(() => ({
    user: state.user,
    isLoading: state.isLoading,
    // Ajout d'une fonction pour forcer la mise à jour
    refreshAuth: () => {
      setTokenVersion(v => v + 1);
    }
  }), [state.user, state.isLoading]);
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
 