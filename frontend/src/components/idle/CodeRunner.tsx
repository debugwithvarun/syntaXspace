
import { Button } from '../ui/button'
import { ArrowRightIcon } from 'lucide-react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { Textarea } from '../ui/textarea'
import { useIdle } from '@/hooks/useIdle'
import { Label } from '../ui/label'
import { useEffect, useState } from 'react'
import { Spinner } from '../ui/spinner'

const CodeRunner = () => {
    const { stdin, code, languageId, setStdin, stdout, setStdout, stderr, setStderr, setPostAllow,setExecuteTime } = useIdle()
    const [loading, setLoading] = useState(false)

    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (loading) {
            setProgress(0);
            let i = 0;
            const interval = setInterval(() => {
                i += 5;
                setProgress(i);
                if (i >= 100) clearInterval(interval);
            }, 60);

            return () => clearInterval(interval);
        } else {
            setProgress(100);
            setTimeout(() => setProgress(0), 400);
        }
    }, [loading]);

    const handleRunCode = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/syntaxspace/run-code", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language_id: languageId,
                    source_code: code,
                    stdin: stdin
                })
            });
            const data = await response.json()
            console.log(data)
            setStderr(data.stderr)
            setStdout(data.stdout)
            setExecuteTime(data.time)
            setPostAllow(true)

        } catch (error) {
            console.log(error)
        } finally {

            setLoading(false)
        }
    }

    return (
        <>
            <Button className="group flex items-center justify-between gap-2"
                onClick={handleRunCode}
                disabled={loading}
            >
                Run
                {!loading ? (<ArrowRightIcon
                    className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    aria-hidden="true"
                />) : (<Spinner />)}
            </Button>
            <ResizablePanelGroup direction="vertical" className="flex flex-col gap-2">
                {/* input panel  */}
                <ResizablePanel defaultSize={25} minSize={20} className='flex flex-col gap-1'>
                    <Label htmlFor="stdin">Input</Label>
                    <Textarea
                        className="dark:bg-[#1e1e1e] shadow-none scrollbar-none  h-[95%] border"
                        placeholder="Enter Input (if any) before run the code"
                        value={stdin}
                        id='stdin'
                        onChange={(e) => {
                            setPostAllow(false)
                            setStdin(e.target.value)
                        }}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />

                {/* output panel  */}
                <ResizablePanel defaultSize={75} minSize={60} className='flex flex-col gap-1'>
                    <Label htmlFor="stdout">Output</Label>
                    {loading ? (
                        <div className="dark:bg-[#1e1e1e] shadow-none scrollbar-none max-h-full h-full  border flex justify-center items-center">
                            <div className="w-2/3 h-3 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-primary w-[70%] transition-all duration-75"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <Textarea
                            className={`
                                font-mono                    
                                text-sm                     
                                leading-tight               
                                tracking-normal     
                                dark:bg-[#1e1e1e] shadow-none scrollbar-none max-h-full h-full  border ${stderr.trim() !== "" ? "text-destructive" : "text-green-500"}`}

                            value={stderr.trim() !== "" ? stderr : stdout}
                            readOnly
                            placeholder="Output Show Here"
                            name='stdout'
                        />)}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}

export default CodeRunner