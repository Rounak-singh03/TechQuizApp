import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // path adjust karo agar different ho
import Login from './component/Login';
import Signup from './component/SIgnup';
import MyResultPage from './pages/MyResultPage';
// import { LogIn } from 'lucide-react';
//private protected route

function RequireAuth({children}){
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));
  const location=useLocation();

  if(!isLoggedIn){
    return <Navigate to="/login" state={{from:location}} replace/>
  }
  return children;
}
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/result" element={
        <RequireAuth>
          <MyResultPage/>
        </RequireAuth>
      }/>
    </Routes>
  );
};

export default App;
