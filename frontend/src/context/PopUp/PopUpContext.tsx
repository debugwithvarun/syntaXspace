import { createContext } from "react";
interface popUpProps { popUp: string; msg: string; setPopUp: React.Dispatch<React.SetStateAction<string>>; setMsg: React.Dispatch<React.SetStateAction<string>>; }
const PopUpContext = createContext<popUpProps | undefined>(undefined)

export default PopUpContext;