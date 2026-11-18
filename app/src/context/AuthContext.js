import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userName, setUserName] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("authToken");
      const name = await AsyncStorage.getItem("userName");
      if (token && name) setUserName(name);
      setIsReady(true);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ userName, setUserName, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
