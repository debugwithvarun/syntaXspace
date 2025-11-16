import { createContext } from "react";

interface IdleContextType{
    open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,

    postallow:boolean,
    setPostAllow:React.Dispatch<React.SetStateAction<boolean>>,
    
    code:string,
    setCode:React.Dispatch<React.SetStateAction<string>>,
    
    language:string,
    setLanguage:React.Dispatch<React.SetStateAction<string>>,
    
    languageId:number,
    setLanguageId:React.Dispatch<React.SetStateAction<number>>,
    
    stdin:string,
    setStdin:React.Dispatch<React.SetStateAction<string>>,
    
    stdout:string,
    setStdout:React.Dispatch<React.SetStateAction<string>>,
    
    stderr:string,
    setStderr:React.Dispatch<React.SetStateAction<string>>,
    
}

const IdleContext=createContext<IdleContextType|undefined>(undefined)

export default IdleContext