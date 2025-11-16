import { createContext } from "react";

interface networkProps{
    tabValue: string;
    setTabValue: React.Dispatch<React.SetStateAction<string>>
}
const NetworkContext=createContext<networkProps|undefined>(undefined)

export default NetworkContext