import EditFrame from "@/components/idle/EditFrame"
import MainFrame from "@/components/idle/MainFrame"
import ViewFrame from "@/components/idle/ViewFrame"
import { useIdle } from "@/hooks/useIdle"
import { useEffect } from "react"



const IdleDashboard = () => {
  const {openView,open,openEdit,setStderr,setCode,setLanguage,setStdin,setStdout,setDesc,setTitle}=useIdle()
  useEffect(()=>{
    // setCode("")
    setLanguage("python")
    setStderr("")
    setStdin("")
    setStdout("")
    setDesc("")
    setTitle("")

  },[setStderr,setCode,setStdin,setStdout,setTitle,setDesc,setLanguage])

  return (
  
        <div className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-500 bg-black/50 ">
            {open && <MainFrame/>}
            {openView && <ViewFrame/>}
            {openEdit && <EditFrame/>}
        </div>

  )
}

export default IdleDashboard