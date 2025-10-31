import PopUpContext from "@/context/PopUpContext"
import { useContext } from "react"

const usePop=()=>{
    const context=useContext(PopUpContext)
    if(!context)
      throw new Error("usePop must be used within an AuthProvider");

    return context

}

export default usePop;