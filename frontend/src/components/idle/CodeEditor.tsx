
import Editor from "@monaco-editor/react"
import ShimmerLoader from "./ShimmerCoder"
import usePop from "@/hooks/usePop"
import { useIdle } from "@/hooks/useIdle"
import { useEffect } from "react"
import { languageOptions } from "@/lib/LanguageOptions"
import * as monacoEditor from "monaco-editor"
import { Hand } from "lucide-react"
const CodeEditor = ({handleOnPost}:{handleOnPost:()=>void}) => {
    
    const {setMsg,setPopUp}=usePop()
    const {code,language,setCode,setPostAllow}=useIdle()

    const handleOnMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus()
        editor.onDidChangeCursorSelection(() => {
            setCode(editor.getValue())
            setPostAllow(false)
        })
      
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
                setMsg("Code Save for this session")
                setPopUp("ds")
            }
        );

    
    }
    
    useEffect(()=>{
        const defaultCode=languageOptions.find((l)=>l.id===language)
        setCode(defaultCode?.boilerplate|| "")
    },[language,setCode])

    return (
        <Editor
            className="w-full rounded-lg overflow-hidden border "
            theme="vs-dark"
            language={language}
            value={code}
            loading={<ShimmerLoader />}

            onMount={handleOnMount}
            options={{
                fontFamily: "JetBrains Mono",
                fontSize: 14,
                minimap: { enabled: true, },
                automaticLayout: true,

                cursorBlinking: "smooth",
                smoothScrolling: true,
                renderWhitespace: "none",
                tabSize: 2,
                lineNumbers: "on",

                wordWrap: "on",
                scrollBeyondLastLine: false,
                padding: { top: 10, bottom: 10 }
            }}
        >

        </Editor>
    )
}

export default CodeEditor