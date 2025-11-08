import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { BookMarked, Heart, MessageCircle } from "lucide-react";

const MiddleSection = () => {
  return (
    <ScrollArea className="h-full w-full p-6  pt-10 ">
      <Card className="w-[70%] p-6 gap-2">

        <div className="flex items-center ">

        <div className="flex flex-row gap-2" >
         <Avatar className="w-13 h-13">
          <AvatarImage src="/origin/avatar-80-07.jpg" alt="Kelly King" />
          <AvatarFallback>KK</AvatarFallback>
         </Avatar>

        <div>

          <h5 className="text-md">shaziya</h5>
          <p className="text-sm">@malikShazu</p>
        </div>


        </div>
  


       
        </div>
        {/* Post Description  */}
        <div className="px-2 mt-4" >these code belong to html css js ..</div>


        {/* post photo  */}

        <div className="h-[300px]  bg-purple-600 rounded-md my-4"></div>


        {/* icons like comment share  */}

        <div className=" flex  justify-between w-full">

        <div className="flex  gap-2">
        <Heart />
        <MessageCircle />
        </div>
        <div>
          <BookMarked />
        </div>

        </div>
         
      </Card>
    </ScrollArea>
  );
};

export default MiddleSection;
