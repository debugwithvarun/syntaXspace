import NetworkContext from "@/context/Network/NetworkContext";
import { useContext } from "react";

export const useNetwork=()=>{
    const context = useContext(NetworkContext);
    if (!context) {
      throw new Error("useNetwork must be used within an NetworkProvider");
    }
    return context;
}

