import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import useChat from "@/hooks/useChat";

const ChatDashboard = () => {
  const { setOpenChat, selectedChat } = useChat();

  return (
    <div
      className="h-screen fixed inset-0 z-599 bg-background/70 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
      onClick={() => setOpenChat(false)}
    >
      <Card
        className="w-full max-w-[1400px] h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] min-h-0 border shadow-lg rounded-2xl overflow-hidden bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden h-full">
          {selectedChat ? <ChatWindow /> : <ChatSidebar />}
        </div>

        <div className="hidden md:block h-full">
          <ResizablePanelGroup direction="horizontal" className="w-full h-full">
            <ResizablePanel
              defaultSize={30}
              minSize={25}
              maxSize={40}
              className="bg-background"
            >
              <ChatSidebar />
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-border hover:bg-primary/50 transition-colors" />

            <ResizablePanel defaultSize={70} minSize={50}>
              <ChatWindow />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </Card>
    </div>
  );
};

export default ChatDashboard;