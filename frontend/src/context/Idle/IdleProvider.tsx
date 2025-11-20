import { useState } from "react"
import IdleContext from "./IdleContext"

const IdleProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false)
    const [postallow, setPostAllow] = useState(false)
    const [code, setCode] = useState("")
    const [stdin, setStdin] = useState("")
    const [executeTime, setExecuteTime] = useState("0")
    const [stdout, setStdout] = useState("")
    const [stderr, setStderr] = useState("")
    const [language, setLanguage] = useState("python")
    const [languageId, setLanguageId] = useState(71)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    return (
        <IdleContext.Provider value={{ open, language, code, setCode, setLanguage, setOpen, stdin, setStdin, languageId, setLanguageId, stderr, setStderr, stdout, setStdout, postallow, setPostAllow, executeTime, setExecuteTime, title, setTitle, desc, setDesc}}>
            {children}
        </IdleContext.Provider>
    )

}

export default IdleProvider;