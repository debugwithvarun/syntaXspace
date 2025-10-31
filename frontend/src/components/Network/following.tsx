import * as React from "react";
import {
  Avatar,
  AvatarFallback,
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

const Followers = () => {
  const [people, setPeople] = React.useState<{ username: string; name: string; _id: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { setPopUp, setMsg } = usePop();
  //   const [change,setChange]=React.useState(false)
  const [remove, setRemove] = React.useState<string[]>([])
  const [invite, setInvite] = React.useState<string[]>([])

  React.useEffect(() => {
    const GetRequest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-following-info`);
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

  const RemoveFollowing = async (username: string) => {
    try {
      const res = await fetch(`/api/remove-following/${encodeURIComponent(username)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (res.ok) {
        setRemove([...remove, username])
        setMsg("Following Remove")
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

  const handleRequest = async (data: { target: string }) => {
    try {


      const res = await fetch("/api/sent-request", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const res_data = await res.json()
      if (res.ok) {
        setInvite([...invite, data.target])
        setMsg(res_data.msg)
        setPopUp("ds")


      }
      else {
        setMsg(res_data.msg)
        setPopUp("de")

      }
    } catch (error) {
      console.log(error)
      setMsg("Something Went Wrong!")
      setPopUp("de")

    }

    // setStatus("loading");

    // // Simulate network request delay
    // setTimeout(() => {
    //   setStatus("sent");
    // }, 1000); // 1 second delay for clean transition
  };
  return (
    <div className="bg-background w-full rounded-xl">
      <h6 className="w-full text-sm font-medium pb-2 px-4 py-4">Your Following</h6>
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
                        <AvatarFallback>{getNameFallback(person.name)}</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-1">
                      <ItemTitle>{person.name}</ItemTitle>
                      <ItemDescription>@{person.username}</ItemDescription>
                    </ItemContent>
                    <ItemGroup className="flex gap-2 flex-row">


                      {!remove.find((uname) => uname === person.username) ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl" >Following</Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Unfollow person</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <b>@{person.username}</b> from your following?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => RemoveFollowing(person.username)}>
                                Yes, Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : <Button variant="outline" className="rounded-xl" onClick={() => handleRequest({ target: person.username })}>{!invite.find((uname) => uname === person.username) ? "Invite" : "Invited"}</Button>}



                    </ItemGroup>
                  </Item>
                  {index !== people.length - 1 && <ItemSeparator />}
                </React.Fragment>
              ))
            ) : (
              <h6 className="min-h-18 w-full flex items-center justify-center text-sm">You not follow anyone</h6>
            )}
          </ItemGroup>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Followers;
