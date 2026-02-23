import { createContext } from "react";

type chatContextProps={
    setOpenChat:(val:boolean)=>void;
    openChat:boolean;
}

const ChatContext=createContext<chatContextProps|null>(null);

export default ChatContext;