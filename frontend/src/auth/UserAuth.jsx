// import React, { useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { UserContext } from '../context/user.context'

// const UserAuth = ({ children }) => {

//     const { user,loading } = useContext(UserContext)
//     // const [ loading, setLoading ] = useState(true)
//     const token = localStorage.getItem('token')
//     const navigate = useNavigate()




//     useEffect(() => {
//         if (user) {
//             setLoading(false)
//         }

//         if (!token) {
//             navigate('/login')
//         }

//         if (!user) {
//             navigate('/login')
//         }

//     }, [])

//     if (loading) {
//         return <div>Loading...</div>
//     }


//     return (
//         <>
//             {children}</>
//     )
// }

// export default UserAuth


import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const UserAuth = ({ children }) => {
    const { user, loading } = useContext(UserContext);

    // Show loading while checking token on app load
    if (loading) {
        return <div>Loading...</div>;
    }

    // Redirect if user is not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Render protected content
    return <>{children}</>;
};

export default UserAuth;
