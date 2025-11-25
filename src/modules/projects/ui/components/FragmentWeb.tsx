import { Fragment } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { Hint } from "./hint";

interface Props{
    data : Fragment
}

export function FragmentWeb({data} : Props){
    const [ fragmentKey , setfragmentKey] = useState(0);
    const [ copied , setcopied]  = useState(false);

    const onRefresh = ()=>{
        setfragmentKey((prev)=>prev + 1)
    }

    const handleCopy = ()=>{
        navigator.clipboard.writeText(data.sandboxUrl);
        setcopied(true);
        setTimeout(()=> setcopied(false), 2000);
    }
    return (
        <div className="flex flex-col w-full h-full">

            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint text="Refresh the tab" side="bottom" align="start">
                    <Button size="sm" variant="outline" onClick={onRefresh}>
                        <RefreshCcwIcon/>
                    </Button>
                </Hint>
                
                <Hint text="copy URL" side="bottom" align="start">
                    <Button size="sm" variant="outline" disabled={!data.sandboxUrl || copied} onClick={handleCopy} className="flex-1 justify-start text-start font-normal">
                        <span className="truncate">
                            {data.sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint text="open in a new tab" side="bottom" align="start">
                    <Button
                    size="sm"
                    disabled={!data.sandboxUrl}
                    variant="outline"
                    onClick={()=>{
                        if(!data.sandboxUrl) return ;
                        window.open(data.sandboxUrl, "_blank");
                    }}
                    >
                        <ExternalLinkIcon/>
                    </Button>
                </Hint>
            </div>
            <iframe
            key = {fragmentKey}
            className="h-full w-full"
            sandbox="allow-forms allow-scripts allow-same-origin"
            loading="lazy"
            src={data.sandboxUrl}
            />
        </div>
    )
}