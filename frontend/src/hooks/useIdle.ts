import IdleContext from "@/context/Idle/IdleContext";
import { useContext } from "react";

export const useIdle=()=>{
    const context = useContext(IdleContext);
    if (!context) {
      throw new Error("useIdle must be used within an IdleProvider");
    }
    return context;
}

