import { useEffect, useState } from "react";
import PopUpContext from "../PopUp/PopUpContext";

const PopUpProvider=({ children }: { children: React.ReactNode })=>{
    const [popUp,setPopUp]=useState("")
    const [msg,setMsg]=useState("")
  
    useEffect(() => {
      if (popUp.trim()==="") return;
    
      const timer = setTimeout(() => setPopUp(""), 3000); 
    
      return () => clearTimeout(timer); 
    }, [popUp, setPopUp]);

    return(
        <PopUpContext.Provider value={{popUp,msg,setPopUp,setMsg}}>
            {children}
        </PopUpContext.Provider>
    )
}

export default PopUpProvider;