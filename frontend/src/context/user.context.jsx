import React, { createContext, useState, useContext,useEffect } from 'react';
import  *as jwt_decode from 'jwt-decode';

// Create the UserContext
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const  [loading,setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1])); // decode payload manually
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);


    return (
        <UserContext.Provider value={{ user, setUser,loading }}>
            {children}
        </UserContext.Provider>
    );
};


