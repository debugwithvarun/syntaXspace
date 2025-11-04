
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const Block = () => {
  return (
    <div className="h-[90vh] w-full flex justify-center items-start ">
      <div className="w-full max-w-4xl rounded-xl ">
        <ScrollArea className="h-[70vh] lg:h-[80vh] rounded-xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>

              <div className="grid grid-rows-1 gap-4 py-4 px-4">
                {/* user profile  */}
               {[...Array(20)].map((_)=>(
              <>
                <div className="w-full flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 pr-12">
                    <div className="w-[33px] h-[33px] bg-secondary aspect-square rounded-full flex justify-center items-center text-white font-semibold">
                      SM
                    </div>

                    <div className="space-y-0.5">
                      <p>
                        <a
                          className="text-sm font-medium hover:underline"
                          href="#"
                        >
                          Shaziya Malik
                        </a>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @shaziya
                      </p>
                    </div>
                  </div>

                
                    <Button
                      variant="secondary"
                      className="px-2 py-1 transition-all"
                      
                    >
                      UnBlock
                    </Button>
                 

             
                </div>
                <Separator />
              </>
              ))}
              </div>
            </CardHeader>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Block;
