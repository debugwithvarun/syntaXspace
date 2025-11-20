import { useEffect, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import logo from "../../assets/logo/purpletext.png"
import {
  Dialog,
  DialogContent,

  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../ui/textarea"

export default function PostDialog({children,handleOnPost,title,setTitle,desc,setDesc}: {children: React.ReactNode, handleOnPost: () => void,title:string,desc:string,setTitle:React.Dispatch<React.SetStateAction<string>>,setDesc:React.Dispatch<React.SetStateAction<string>>}) {

    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
      if (title.trim() !== "" && desc.trim() !== "") {
        setEnabled(true)
      } else {
        setEnabled(false)
      }
    }, [title, desc])

  const id = useId()
  return (
    <Dialog>

      <DialogTrigger asChild>
        
            {children}
        
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
     
         <img src={logo} alt="logo" className="h-15" />
         
    
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-title`}>Title</Label>
              <Input
                id={`${id}-title`}
                placeholder="Program for Plaindrome"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-description`}>Description</Label>
              <Textarea
                id={`${id}-description`}
                placeholder="A program to check whether a string is palindrome or not"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
            </div>
          </div>
       
        <div className="flex w-full justify-end items-end">
        <Button type="button" onClick={handleOnPost} disabled={!enabled}>
            Post
          </Button>
        </div>
        </form>

      </DialogContent>
    </Dialog>
  )
}
