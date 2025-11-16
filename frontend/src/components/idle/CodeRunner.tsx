
import { Button } from '../ui/button'
import { ArrowRightIcon } from 'lucide-react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { Textarea } from '../ui/textarea'
import { useIdle } from '@/hooks/useIdle'
import { Label } from '../ui/label'

const CodeRunner = () => {
    const {stdin,setStdin} = useIdle()
    return (
        <>
            <Button className="group flex items-center justify-between gap-2" >
                Run
                <ArrowRightIcon
                    className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    aria-hidden="true"
                />
            </Button>
            <ResizablePanelGroup direction="vertical" className="flex flex-col gap-2">
                <ResizablePanel defaultSize={25} minSize={20} className='flex flex-col gap-1'>
                <Label htmlFor="stdin">Input</Label>
                    <Textarea
                        className="dark:bg-[#1e1e1e] shadow-none scrollbar-none  h-[95%] border"
                        placeholder="Enter Input (if any) before run the code" 
                        value={stdin}
                        id='stdin'
                        onChange={(e)=>setStdin(e.target.value)}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75} minSize={60} className='flex flex-col gap-1'>
                <Label htmlFor="stdout">Output</Label>
                    <Textarea
                        className="dark:bg-[#1e1e1e] shadow-none scrollbar-none max-h-full h-full  border"
                        placeholder="Output Show Here"
                        name='stdout'
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}

export default CodeRunner