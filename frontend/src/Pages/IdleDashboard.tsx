import EditFrame from "@/components/idle/EditFrame"
import MainFrame from "@/components/idle/MainFrame"
import ViewFrame from "@/components/idle/ViewFrame"
import { useIdle } from "@/hooks/useIdle"



const IdleDashboard = () => {
  const {openView,open,openEdit}=useIdle()
  // useEffect(()=>{
  //   setTitle("")
  //   setDesc("")
  //   // setLanguage("python")
 
  //   setStdin("")
  //   setStdout("")

  // },[setDesc,setStdin,setTitle,setStdout])

  return (
  
        <div className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-500 bg-black/50 ">
            {open && <MainFrame/>}
            {openView && <ViewFrame/>}
            {openEdit && <EditFrame/>}
        </div>

  )
}

export default IdleDashboard