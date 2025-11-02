import { useLocation } from "react-router-dom";
import Login from "@/components/login/Login";
import Signup from "@/components/login/Signup";
import space from "../assets/login/space.png";
// import usePop from "@/hooks/usePop";
// import { useEffect, useState } from "react";
// import ErrorPopUp from "@/components/errorPopUp";
// import SuccessPopUp from "@/components/sucessPopUp";
// import WarningPopUp from "@/components/warningPopUp";

const Authentication = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  

  return (
    <div
      className="w-full min-h-screen flex"
      style={{ backgroundColor: "var(--color-background)" }}
    >

      <div className="w-full max-h-screen overflow-hidden max-lg:hidden">
        <img src={space} alt="Space Image" className="h-full w-full" />
      </div>
      <div
        className="w-full h-full flex justify-center items-center"
        style={{ color: "var(--color-foreground)" }}
      >
        {isLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default Authentication;
