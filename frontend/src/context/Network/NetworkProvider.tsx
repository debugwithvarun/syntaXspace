import { useState, type ReactNode } from "react";
import NetworkContext from "../Network/NetworkContext";


export const NetworkProvider=({ children }: { children: ReactNode })=>{
    const [tabValue,setTabValue]=useState("tab-1")
    return(
        <NetworkContext.Provider value={{tabValue,setTabValue}}>
            {children}
        </NetworkContext.Provider>
    )
}