import { RxCross2 } from "react-icons/rx";
import Xlogo from "../../assets/logo/purpletext.png"
import { Card } from '../ui/card'
import { useIdle } from "@/hooks/useIdle";

import { CodeBox } from "./CodeBox";
import { Button } from "../ui/button";
import usePop from "@/hooks/usePop";
import PostDialog from "./PostDialog";

const MainFrame = () => {
    const { setOpen, postallow, code, language, languageId, stdin, stdout, stderr, executeTime, title, desc, setTitle, setDesc } = useIdle()

    const { setMsg, setPopUp } = usePop()
    const handleOnPost = async () => {
        try {
            const res = await fetch("/api/syntaxspace/save-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code, language, languageId, stdin, stdout, stderr, time: executeTime, title, description: desc
                })
            });
            if (!res.ok) {
                setMsg("Something Went Wrong")
                setPopUp("de")
            }
            else {
                const data = await res.json()
                setMsg(data.msg)
                setPopUp("ds")
                setOpen(false)
            }
        } catch (error) {
            console.log(error)
        }
        console.log("code post ")
    }
    return (
        <Card className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50  w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 pt-2 shadow-lg duration-200 h-[95%]">
            {/* <img src={xlogo} className='h-9 w-9 absolute right-5 top-5 cursor-pointer'></img> */}
            <div className="w-full h-fit flex justify-between items-center">
                <img src={Xlogo} alt="syntaXSpce" className="h-9" />
                <RxCross2 className='font-bold text-2xl  cursor-pointer' onClick={() => setOpen(false)} />
            </div>


            <CodeBox />

            <div className="flex w-full justify-end items-center gap-2 ">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <PostDialog handleOnPost={handleOnPost} title={title} setTitle={setTitle} desc={desc} setDesc={setDesc}>
                    <Button disabled={!postallow} >Next</Button>
                </PostDialog>
            </div>

        </Card>
    )
}

export default MainFrame