import { useState } from "react"

import { Card } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"
import useChat from "@/hooks/useChat"


export const MOCK_CONTACTS = [
  { id: 1, name: "Alice Freeman", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Let me know when you're free!", time: "10:23 AM", unread: 2, online: true, isTyping: false },
  { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob", lastMessage: "The designs look great.", time: "Yesterday", unread: 0, online: false, isTyping: true },
  { id: 3, name: "Design Team", avatar: "", lastMessage: "Sarah: I'll update the Figma file.", time: "Yesterday", unread: 0, online: true, isTyping: false },
  { id: 4, name: "Guillermo Rauch", avatar: "https://github.com/rauchg.png", lastMessage: "Vercel deploy finished successfully.", time: "Tuesday", unread: 0, online: true, isTyping: false },
  { id: 1, name: "Alice Freeman", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Let me know when you're free!", time: "10:23 AM", unread: 2, online: true, isTyping: false },
  { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob", lastMessage: "The designs look great.", time: "Yesterday", unread: 0, online: false, isTyping: true },
  { id: 3, name: "Design Team", avatar: "", lastMessage: "Sarah: I'll update the Figma file.", time: "Yesterday", unread: 0, online: true, isTyping: false },
  { id: 4, name: "Guillermo Rauch", avatar: "https://github.com/rauchg.png", lastMessage: "Vercel deploy finished successfully.", time: "Tuesday", unread: 0, online: true, isTyping: false },
  { id: 1, name: "Alice Freeman", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Let me know when you're free!", time: "10:23 AM", unread: 2, online: true, isTyping: false },
  { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob", lastMessage: "The designs look great.", time: "Yesterday", unread: 0, online: false, isTyping: true },
  { id: 3, name: "Design Team", avatar: "", lastMessage: "Sarah: I'll update the Figma file.", time: "Yesterday", unread: 0, online: true, isTyping: false },
  { id: 4, name: "Guillermo Rauch", avatar: "https://github.com/rauchg.png", lastMessage: "Vercel deploy finished successfully.", time: "Tuesday", unread: 0, online: true, isTyping: false },
  { id: 1, name: "Alice Freeman", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Let me know when you're free!", time: "10:23 AM", unread: 2, online: true, isTyping: false },
  { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob", lastMessage: "The designs look great.", time: "Yesterday", unread: 0, online: false, isTyping: true },
  { id: 3, name: "Design Team", avatar: "", lastMessage: "Sarah: I'll update the Figma file.", time: "Yesterday", unread: 0, online: true, isTyping: false },
  { id: 4, name: "Guillermo Rauch", avatar: "https://github.com/rauchg.png", lastMessage: "Vercel deploy finished successfully.", time: "Tuesday", unread: 0, online: true, isTyping: false },
]

export const MOCK_MESSAGES = [
  { type: "date", text: "Today" },
  { id: 1, text: "Hey! Did you get a chance to look at the new mockups?", sender: "them", time: "10:15 AM", status: "read" },
  { id: 2, text: "Yes, I just reviewed them. They look solid! We just need to tweak the navbar spacing.", sender: "me", time: "10:18 AM", status: "read" },
  { id: 3, text: "Awesome. I'll make those changes now.", sender: "them", time: "10:20 AM", status: "read" },
  { type: "unread_divider" },
  { id: 4, text: "Let me know when you're free to hop on a quick video call to review.", sender: "them", time: "10:23 AM", status: "delivered" },
  { id: 1, text: "Hey! Did you get a chance to look at the new mockups?", sender: "them", time: "10:15 AM", status: "read" },
  { id: 2, text: "Yes, I just reviewed them. They look solid! We just need to tweak the navbar spacing.", sender: "me", time: "10:18 AM", status: "read" },
  { id: 3, text: "Awesome. I'll make those changes now.", sender: "them", time: "10:20 AM", status: "read" },
  { type: "unread_divider" },
  { id: 4, text: "Let me know when you're free to hop on a quick video call to review.", sender: "them", time: "10:23 AM", status: "delivered" },
  { id: 1, text: "Hey! Did you get a chance to look at the new mockups?", sender: "them", time: "10:15 AM", status: "read" },
  { id: 2, text: "Yes, I just reviewed them. They look solid! We just need to tweak the navbar spacing.", sender: "me", time: "10:18 AM", status: "read" },
  { id: 3, text: "Awesome. I'll make those changes now.", sender: "them", time: "10:20 AM", status: "read" },
  { type: "unread_divider" },
  { id: 4, text: "Let me know when you're free to hop on a quick video call to review.", sender: "them", time: "10:23 AM", status: "delivered" },
]






const ChatDashboard = () => {
  const { setOpenChat } = useChat()
  const [selectedContactId, setSelectedContactId] = useState(MOCK_CONTACTS[0].id)
  const selectedContact = MOCK_CONTACTS.find(c => c.id === selectedContactId)

  return (
    <div className="h-screen fixed z-699 w-full bg-black/50 p-4 md:p-6 flex items-center justify-center" onClick={()=>setOpenChat(false)}>

      <Card className="w-full max-w-[1400px] h-[calc(100vh-3rem)] min-h-[600px] border shadow-xl rounded-2xl overflow-hidden bg-background"
      onClick={(e)=>e.stopPropagation()}
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full"
        >
          {/* Left Sidebar Panel */}
          <ResizablePanel
            defaultSize={30}
            minSize={25}
            maxSize={40}
            className="bg-background"
          >
            <ChatSidebar
              contacts={MOCK_CONTACTS}
              selectedContactId={selectedContactId}
              onSelectContact={setSelectedContactId}
            />
          </ResizablePanel>

          <ResizableHandle className="w-[1px] bg-border hover:bg-primary/50 transition-colors" />

          <ResizablePanel defaultSize={70} minSize={50}>
            <ChatWindow contact={selectedContact} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  )
}

export default ChatDashboard;