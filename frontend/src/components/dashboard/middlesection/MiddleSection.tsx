import { ScrollArea } from "@/components/ui/scroll-area";
import PostCard from "./PostCard";

const MiddleSection = () => {
  return (
    <ScrollArea
      className="
        h-full w-full px-6 mb-10 
        overflow-y-auto
        scroll-smooth
        overscroll-y-auto
      "
      style={{
        scrollBehavior: "smooth",
      }}
    >
      <div className="pt-10 flex flex-col gap-4 pb-[30vh]">
        {/* extra bottom space so last card is fully visible */}
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
        <PostCard />
      </div>
    </ScrollArea>
  );
};

export default MiddleSection;
