import { RxCross2 } from "react-icons/rx";
import Xlogo from "../../assets/logo/purpletext.png"
import { Card } from '../ui/card'
import { useIdle } from "@/hooks/useIdle";
import { CodeBox } from "./CodeBox";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import useChat from "@/hooks/useChat";


const ViewFrame = () => {

  const {
    id,
    setCode,
    setLanguageId,
    setStdin,
    setStdout,
    setStderr,
    setOpenView,
    setLanguage

  } = useIdle()
  const { socket } = useChat();

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    const fetchPostData = async () => {
      try {
        const res = await apiFetch(`/syntaxspace/idle-get?id=${id}`, {
          signal: controller.signal,
        })

        const data = await res.json()
        // console.log(data)
        if (!res.ok || !data?.success) {
          console.error(data?.message || "Failed to fetch post.")
          return
        }

        const post_data = data.data

        console.log(post_data)
        setCode(post_data.code || "")
        setLanguageId(Number(post_data.languageId))
        setStdin(post_data.stdin || "")
        setStdout(post_data.stdOut || "")
        setStderr(post_data.stderr || "")
    
        setLanguage(post_data.language || "")
        setOpenView(true)
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return
        if (error instanceof Error) {
          console.error("Error fetching idle post:", error)
        } else {
          console.error("Error fetching idle post:", String(error))
        }
      }
    }

    fetchPostData()

    return () => controller.abort()
  }, [id, setCode, setLanguageId, setStdin, setStdout, setStderr, setOpenView, setLanguage])

  useEffect(() => {
    if (!socket || !id) return;
    const onPostUpdated = async ({ postId }: { postId?: string }) => {
      if (!postId || postId !== id) return;
      try {
        const res = await apiFetch(`/syntaxspace/idle-get?id=${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const postData = data?.data;
        if (!postData) return;
        setCode(postData.code || "");
        setLanguageId(Number(postData.languageId));
        setStdin(postData.stdin || "");
        setStdout(postData.stdOut || "");
        setStderr(postData.stderr || "");
        setLanguage(postData.language || "");
      } catch (error) {
        console.error("Realtime refresh failed:", error);
      }
    };
    socket.on("post-updated", onPostUpdated);
    return () => {
      socket.off("post-updated", onPostUpdated);
    };
  }, [socket, id, setCode, setLanguageId, setStdin, setStdout, setStderr, setLanguage]);

 

  return (
    <Card className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-1000  w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 pt-2 shadow-lg duration-200 h-[90%]">
      {/* <img src={xlogo} className='h-9 w-9 absolute right-5 top-5 cursor-pointer'></img> */}
      <div className="w-full h-fit flex justify-between items-center">
        <img src={Xlogo} alt="syntaXSpce" className="h-9" />
        <RxCross2 className='font-bold text-2xl  cursor-pointer' onClick={() => setOpenView(false)} />
      </div>


      <CodeBox />



    </Card>
  )
}

export default ViewFrame