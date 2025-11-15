
import * as React from "react"


import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    // AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Item,

    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item"
import usePop from "@/hooks/usePop"
import ProfileShimmer from "../Skelton/ProfileShimmer"
import ImagePath from "@/lib/ImagePath"

// const people = [
//     {
//         username: "shadcn",
//         avatar: "https://github.com/shadcn.png",
//         email: "shadcn@vercel.com",
//     },
//     {
//         username: "maxleiter",
//         avatar: "https://github.com/maxleiter.png",
//         email: "maxleiter@vercel.com",
//     },
//     {
//         username: "evilrabbit",
//         avatar: "https://github.com/evilrabbit.png",
//         email: "evilrabbit@vercel.com",
//     },
//     {
//         username: "shadcn",
//         avatar: "https://github.com/shadcn.png",
//         email: "shadcn@vercel.com",
//     },
//     {
//         username: "maxleiter",
//         avatar: "https://github.com/maxleiter.png",
//         email: "maxleiter@vercel.com",
//     },
//     {
//         username: "evilrabbit",
//         avatar: "https://github.com/evilrabbit.png",
//         email: "evilrabbit@vercel.com",
//     },
//     {
//         username: "shadcn",
//         avatar: "https://github.com/shadcn.png",
//         email: "shadcn@vercel.com",
//     },
//     {
//         username: "maxleiter",
//         avatar: "https://github.com/maxleiter.png",
//         email: "maxleiter@vercel.com",
//     },
//     {
//         username: "evilrabbit",
//         avatar: "https://github.com/evilrabbit.png",
//         email: "evilrabbit@vercel.com",
//     },
// ]

export function ProfileSent() {
    const [people, setPeople] = React.useState<{ username: string, name: string, _id: string, profilepic: string }[]>([])
    const [loading, setLoading] = React.useState(false)
    const [change, setChange] = React.useState(false)
    const { setPopUp, setMsg } = usePop()
    React.useEffect(() => {
        const GetRequest = async () => {
            setLoading(true);
            try {

                const res = await fetch(`/api/get-sent-requests`);

                if (res.ok) {
                    const { data } = await res.json();
                    // console.log(data)
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
    }, [change]);

    const getNameFallback = (name: string) => {
        const splitName = name?.split(" ");

        // Get the first character of each part and capitalize it
        return splitName?.map((part: string) => part.charAt(0).toUpperCase()).join("");
    }

    const RemoveSentRequest = async (username: string) => {
        try {
            const res = await fetch(`/api/delete-sent-request/${encodeURIComponent(username)}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (res.ok) {

                setMsg("Sent Request Remove")
                setPopUp("ds")
                setChange((prev) => !prev)
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
        <div className="flex min-h-20 w-full flex-col gap-6">
            <ItemGroup>
                {loading ?
                    <ProfileShimmer />

                    : (
                        people.length > 0 ?
                            (people.map((person, index) => (
                                <React.Fragment key={person.username}>
                                    <Item>
                                        <ItemMedia>
                                            <Avatar>
                                                {/* <AvatarImage src={person.avatar} className="grayscale" /> */}
                                                <AvatarImage src={`${ImagePath(person.profilepic)}`} alt="profilepic"></AvatarImage>

                                                <AvatarFallback>{getNameFallback(person.name)}</AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="gap-1">
                                            <ItemTitle>{person.name}</ItemTitle>
                                            <ItemDescription>@{person.username}</ItemDescription>
                                        </ItemContent>
                                        <ItemGroup className="flex gap-2 flex-row">
                                            <Button variant="destructive" className="rounded-xl "
                                                onClick={() => RemoveSentRequest(person.username)}
                                            >
                                                cancel
                                            </Button>

                                        </ItemGroup>
                                    </Item>
                                    {index !== people.length - 1 && <ItemSeparator />}
                                </React.Fragment>
                            ))) : <h6 className="min-h-18 w-full flex items-center justify-center text-sm ">Explore syntaXspace and sent Invite</h6>
                    )}
            </ItemGroup>
        </div>
    )
}
