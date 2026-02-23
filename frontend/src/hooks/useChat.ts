import ChatContext from "@/context/chat/ChatContext";
import { useContext } from "react";


export const useChat=()=>{
    const context = useContext(ChatContext);
    if (!context) {
      throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}

export default useChat;