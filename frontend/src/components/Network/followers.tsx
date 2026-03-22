import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import usePop from "@/hooks/usePop";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import ProfileShimmer from "../Skelton/ProfileShimmer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import ImagePath from "@/lib/ImagePath";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";

const Followers = () => {
  const [people, setPeople] = React.useState<{ username: string; name: string;profilepic:string, _id: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { setPopUp, setMsg } = usePop();
  //   const [change,setChange]=React.useState(false)
  const [remove, setRemove] = React.useState<string[]>([])


  React.useEffect(() => {
    const GetRequest = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/get-follower-info`);
        if (res.ok) {
          const { data } = await res.json();
          setPeople(data);

        } else {
          setPeople([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setPeople([]);
      }
      setLoading(false);
    };

    GetRequest();
  }, []);

  const getNameFallback = (name: string) => {
    const splitName = name?.split(" ");
    return splitName?.map((part) => part.charAt(0).toUpperCase()).join("");
  };

  const RemoveFollower = async (username: string) => {
    try {
      const res = await apiFetch(`/remove-follower/${encodeURIComponent(username)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setRemove([...remove, username])
        setMsg("Folllower Remove")
        setPopUp("ds")

        // setChange((prev)=>!prev)
      }
      else {
        const data = await res.json()
        setMsg(data.msg)
        setPopUp("dw")
      }

    } catch (error) {
      console.log(error)
      setMsg("Something went wrong")
      setPopUp("de")
    }
  }
  return (
    <div className="bg-background w-full rounded-xl">
      <h6 className="w-full text-sm font-medium pb-2 px-4 py-4">Your Followers</h6>
      <Separator className="mb-2" />
      <ScrollArea className="max-h-[70vh] overflow-auto scrollbar-none px-4">
        <div className="flex min-h-20 w-full flex-col gap-6">
          <ItemGroup>
            {loading ? (
              <ProfileShimmer />
            ) : people.length > 0 ? (
              people.map((person, index) => (
                <React.Fragment key={person.username}>
                  <Item>
                  
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage src={`${ImagePath(person.profilepic)}`} alt="profilepic"></AvatarImage>
                        <AvatarFallback>{getNameFallback(person.name)}</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-1">
                    <Link to={`/community/${person.username}`}>
                      <ItemTitle>{person.name}</ItemTitle>
                      <ItemDescription>@{person.username}</ItemDescription>
                    </Link>
                    </ItemContent>
                    <ItemGroup className="flex gap-2 flex-row">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="rounded-xl">
                            {!remove.find((uname) => uname === person.username) ? "Remove" : "Removed"}

                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Follower</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <b>@{person.username}</b> from your followers?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => RemoveFollower(person.username)}>
                              Yes, Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>


                    </ItemGroup>
                  </Item>
                  {index !== people.length - 1 && <ItemSeparator />}
                </React.Fragment>
              ))
            ) : (
              <h6 className="min-h-18 w-full flex items-center justify-center text-sm">No one follows you yet</h6>
            )}
          </ItemGroup>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Followers;
