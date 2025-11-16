import { createContext } from "react";

interface IdleContextType{
    open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,
    
    code:string,
    setCode:React.Dispatch<React.SetStateAction<string>>,
    
    language:string,
    setLanguage:React.Dispatch<React.SetStateAction<string>>,
    
    stdin:string,
    setStdin:React.Dispatch<React.SetStateAction<string>>,
    
}

const IdleContext=createContext<IdleContextType|undefined>(undefined)

export default IdleContext