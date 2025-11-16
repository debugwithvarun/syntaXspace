import { useState } from "react"
import IdleContext from "./IdleContext"

const IdleProvider=({children}:{children:React.ReactNode})=>{
    const [open,setOpen]=useState(true)
    const [postallow,setPostAllow]=useState(false)
    const [code,setCode]=useState("")
    const [stdin,setStdin]=useState("")
    const [stdout,setStdout]=useState("")
    const [stderr,setStderr]=useState("")
    const [language,setLanguage]=useState("python")
    const [languageId,setLanguageId]=useState(71)

    return(
        <IdleContext.Provider value={{open,language,code,setCode,setLanguage,setOpen,stdin,setStdin,languageId,setLanguageId,stderr,setStderr,stdout,setStdout,postallow,setPostAllow}}>
            {children}
        </IdleContext.Provider>
    )

}

export default IdleProvider;