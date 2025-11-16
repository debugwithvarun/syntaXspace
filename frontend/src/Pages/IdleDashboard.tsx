import MainFrame from "@/components/idle/MainFrame"



const IdleDashboard = () => {
  return (
  
        <div className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 ">
            <MainFrame/>
        </div>

  )
}

export default IdleDashboard