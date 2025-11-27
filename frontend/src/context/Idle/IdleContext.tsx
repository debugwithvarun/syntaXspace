import { createContext } from "react";

interface IdleContextType{
    open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,

    openView:boolean,
    setOpenView:React.Dispatch<React.SetStateAction<boolean>>,

    openEdit:boolean,
    setOpenEdit:React.Dispatch<React.SetStateAction<boolean>>,

    id:string,
    setId:React.Dispatch<React.SetStateAction<string>>,

    postallow:boolean,
    setPostAllow:React.Dispatch<React.SetStateAction<boolean>>,
    
    code:string,
    setCode:React.Dispatch<React.SetStateAction<string>>,
    
    executeTime:string,
    setExecuteTime:React.Dispatch<React.SetStateAction<string>>,
    
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

    title:string,
    setTitle:React.Dispatch<React.SetStateAction<string>>,

    desc:string,
    setDesc:React.Dispatch<React.SetStateAction<string>>,
    
}

const IdleContext=createContext<IdleContextType|undefined>(undefined)

export default IdleContext