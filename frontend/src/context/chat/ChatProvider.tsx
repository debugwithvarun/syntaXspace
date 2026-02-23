import { useState } from "react";
import ChatContext from "./ChatContext";


const ChatProvider = ({children}:{children:React.ReactNode}) => {
    const [openChat,setOpenChat]=useState(false);
  return (
    <ChatContext.Provider value={{openChat,setOpenChat}}>
        {children}
    </ChatContext.Provider>
  )
}

export default ChatProvider