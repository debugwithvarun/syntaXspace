import { useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePop from "@/hooks/usePop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImagePath from "@/lib/ImagePath";
import { Link } from "react-router-dom";

export default function PeopleYouMayKnow({
  rcmd,
}: {
  rcmd: { name: string; username: string, profilepic:string };
}) {
  // 1. already
  // 2. sent
  // 3. idle
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "already">("idle");
  
  useEffect(() => {
    const getStatus = async (target: string) => {
      const res = await fetch(`/api/check-status/${target}`)
      const res_json = await res.json()
      // console.log("user : ",target," status : ",res_json.status)

      setStatus(res_json.status)
    }
    getStatus(rcmd.username)
  }, [rcmd.username])
  const { setMsg, setPopUp } = usePop()

  const handleRequest = async (data: { target: string }) => {
    try {

      setStatus("loading")
      const res = await fetch("/api/sent-request", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const res_data = await res.json()
      if (res.ok) {
        setMsg(res_data.msg)
        setPopUp("ds")
        setStatus("sent")
      }
      else {
        setMsg(res_data.msg)
        setPopUp("de")
        setStatus("idle")
      }
    } catch (error) {
      console.log(error)
      setMsg("Something Went Wrong!")
      setPopUp("de")
      setStatus("idle")
    }

    // setStatus("loading");

    // // Simulate network request delay
    // setTimeout(() => {
    //   setStatus("sent");
    // }, 1000); // 1 second delay for clean transition
  };

  const FallbackText = (name: string) => {
    const splitName = name?.split(" ");
    const initials = splitName
      ?.map((part: string) => part.charAt(0).toUpperCase())
      .join("");
    return initials;
  };



  return (
    <div className="w-full flex items-center justify-between py-2">
      <div className="flex items-center gap-3 px-4 pr-12">
        <Avatar>
          <AvatarImage src={`${ImagePath(rcmd.profilepic)}`} alt="Profile image" />
          <AvatarFallback>{FallbackText(rcmd.name)}</AvatarFallback>
        </Avatar>
 

        <div className="space-y-0.5">
          <p>
            <Link
              className="text-sm font-medium hover:underline"
              to={`/community/${rcmd.username}`}
            >
              {rcmd.name}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">@{rcmd.username}</p>
        </div>
      </div>

      {/* Button states */}
      {status === "idle" && (
        <Button
          variant="secondary"
          className="px-2 py-1 transition-all"
          onClick={() => handleRequest({ target: rcmd.username })}
        >
          Invite
        </Button>
      )}

      {status === "loading" && (
        <LoaderCircleIcon className="animate-spin text-muted-foreground" size={20} />
      )}

      {status === "sent" && (
        <Button
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white cursor-default"
          disabled
        >
          Sent
        </Button>
      )}
    </div>
  );
}


