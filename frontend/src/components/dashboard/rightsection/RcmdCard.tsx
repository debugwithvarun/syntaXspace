import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card';
import PeopleYouMayKnow from './PeopleYouMayKnow';
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { apiFetch } from '@/lib/api';
type UserField = {
    name: string;
    username: string;
    profilepic:string
};
const RcmdCard = () => {

    const [rcmd, setRcmd] = useState<UserField[]>([]);

    useEffect(() => {
        const getRcmd = async () => {
            try {
                setRcmd([])
                const res = await apiFetch("/get-rcmd");
                const data = await res.json();
                const userField: UserField[] = data.rcmd;
                setRcmd((prev) => [...prev, ...userField]);
            } catch (error) {
                console.log(error);
            }
        };

        getRcmd();
    }, []);
    return (
        <Card className="py-0 pt-4 gap-4 bg-secondary overflow-hidden">
            <h6 className="scroll-m-20 text-sm font-semibold tracking-tight px-6">
                People You May Know
            </h6>
            <ScrollArea className="max-h-[220px] bg-background py-4 rounded-xl rounded-t-none">
                <div className="flex flex-col gap-2 pr-6 ">
                    {rcmd.length !== 0 ?
                        rcmd.map((item, index) => (
                            <React.Fragment key={index} >

                                <PeopleYouMayKnow rcmd={item} />


                            </React.Fragment>
                        )) : (<p className="font md pl-6 text-sm">No suggestions at this time.</p>)
                    }
                </div>
            </ScrollArea>
        </Card>
    )
}

export default RcmdCard