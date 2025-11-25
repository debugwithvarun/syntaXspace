import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import LanguageButton from "./LanguageButton"


import CodeEditor from "./CodeEditor"

import CodeRunner from "./CodeRunner"
import { useIdle } from "@/hooks/useIdle"

export function CodeBox() {
    const {openView}=useIdle()
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[200px] max-w-full rounded-lg border md:min-w-[450px]"
        >
            <ResizablePanel defaultSize={65} className="p-2 flex flex-col gap-4" minSize={30}>

                {!openView && <LanguageButton />}

                <CodeEditor/>

            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} className="p-2 flex flex-col gap-4 items-start" minSize={20}>
                <CodeRunner/>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
