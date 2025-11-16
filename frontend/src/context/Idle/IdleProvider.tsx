import { useState } from "react"
import IdleContext from "./IdleContext"

const IdleProvider=({children}:{children:React.ReactNode})=>{
    const [open,setOpen]=useState(true)
    const [code,setCode]=useState("")
    const [stdin,setStdin]=useState("")
    const [language,setLanguage]=useState("python")

    return(
        <IdleContext.Provider value={{open,language,code,setCode,setLanguage,setOpen,stdin,setStdin}}>
            {children}
        </IdleContext.Provider>
    )

}

export default IdleProvider