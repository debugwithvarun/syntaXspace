import { useEffect, useState } from "react"
import IdleContext from "./IdleContext"
import { languageOptions } from "@/lib/LanguageOptions"

const IdleProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false)
    const [openView, setOpenView] = useState(false)
    const [postallow, setPostAllow] = useState(false)
    const [code, setCode] = useState("")
    const [id, setId] = useState("")
    const [stdin, setStdin] = useState("")
    const [executeTime, setExecuteTime] = useState("0")
    const [stdout, setStdout] = useState("")
    const [stderr, setStderr] = useState("")
    const [language, setLanguage] = useState("python")
    const [languageId, setLanguageId] = useState(71)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [openEdit, setOpenEdit] = useState(false)
    const [collabSessionId, setCollabSessionId] = useState("")
    const [collabUsers, setCollabUsers] = useState<{ _id: string; name: string; username?: string }[]>([])
    const [isCollabConnected, setIsCollabConnected] = useState(false)

    useEffect(() => {
        const matched = languageOptions.find((option) => option.id === language);
        if (matched && matched.judge0 !== languageId) {
            setLanguageId(matched.judge0);
        }
    }, [language, languageId]);

    return (
        <IdleContext.Provider value={{ open, language, code, setCode, setLanguage, setOpen, stdin, setStdin, languageId, setLanguageId, stderr, setStderr, stdout, setStdout, postallow, setPostAllow, executeTime, setExecuteTime, title, setTitle, desc, setDesc,openView, setOpenView,id,setId, openEdit, setOpenEdit, collabSessionId, setCollabSessionId, collabUsers, setCollabUsers, isCollabConnected, setIsCollabConnected }}>
            {children}
        </IdleContext.Provider>
    )

}

export default IdleProvider;