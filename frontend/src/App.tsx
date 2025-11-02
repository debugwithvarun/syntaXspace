import { Route, Routes } from "react-router-dom"
import Authentication from "./Pages/Authentication"
import PrivateRoute from "./Routes/PrivateRoute"


import AppDashboard from "./Pages/AppDashboard"
// import { useEffect, useState } from "react"
import ErrorPopUp from "./components/popup/errorPopUp"
import SuccessPopUp from "./components/popup/sucessPopUp"
import WarningPopUp from "./components/popup/warningPopUp"
import usePop from "./hooks/usePop"
import NetworkDashbaord from "./Pages/NetworkDashbaord"
import Setting from "./Pages/Setting"
import Logout from "./components/login/Logout"


const App = () => {
 const {popUp,msg} =  usePop()
  return (
    <>
     <div className="fixed z-10 top-6 right-6">
        {popUp==="e" && <ErrorPopUp msg={msg}/>}
        {popUp==="s" && <SuccessPopUp msg={msg}/>}
        {popUp==="w" && <WarningPopUp msg={msg}/>}
        
      </div>
     <div className="fixed z-10 bottom-6 left-6">
        {popUp==="de" && <ErrorPopUp msg={msg}/>}
        {popUp==="ds" && <SuccessPopUp msg={msg}/>}
        {popUp==="dw" && <WarningPopUp msg={msg}/>}
        
      </div>
    <Routes >
     
      <Route path="/signup" element={<Authentication/>} />
      <Route path="/login" element={<Authentication/>} />

      <Route element={<PrivateRoute/>}>
        <Route path="/" element={<AppDashboard/>}/>
        <Route path="/setting" element={<Setting/>}/>
        <Route path="/network" element={<NetworkDashbaord/>}/>
        <Route path="/logout" element={<Logout/>}/>
      </Route>
    </Routes>
    </>
  )
}

export default App