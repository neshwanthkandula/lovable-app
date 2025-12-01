"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useTRPC } from "@/trpc/client"
import { dehydrate, HydrationBoundary, QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@prisma/client";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/FragmentWeb";
import { CrownIcon, EyeIcon, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Codeview } from "@/components/code-view/index";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
interface Props {
    projectId : string
}

export const Projectview = ({ projectId } : Props)=>{
    const [activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
    const [tabState, setTabState] =  useState<"preview" | "code" | "selectFragment">("selectFragment")
    const trpc = useTRPC();
    return <div className="h-screen">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel 
            defaultSize={35}
            minSize={20}
            className="flex flex-col min-h-0"
            >
                <Suspense fallback={<p>Loading messages...</p>}>
                    <ProjectHeader projectId={projectId} />
                </Suspense>
                <Suspense fallback={<p>Loading messages...</p>}>
                    <MessagesContainer projectId={projectId}
                    activeFragment = {activeFragment}
                    setActiveFragment = {setActiveFragment}
                    />
                </Suspense>
            </ResizablePanel>

            <ResizableHandle withHandle></ResizableHandle>
            <ResizablePanel
            defaultSize={65}
            minSize={50}
            >
                <Tabs
                className="h-full gap-y-0"
                defaultValue="preview"
                value={tabState}
                onValueChange={(value)=> setTabState(value as "preview" | "code")}
                >
                    <div className="w-full flex items-center p-2 border-b gap-x-2">
                        <TabsList className="h-8 p-0 border roundeed-md">
                            <TabsTrigger value="preview" className="rounded-md">
                                <EyeIcon/> <span>Demo</span>
                            </TabsTrigger>
                            <TabsTrigger value="code" className="rounded-md">
                                <EyeIcon/> <span>Code</span>
                            </TabsTrigger>
                        </TabsList>
                        <div>
                            <UserControl/>
                        </div>

                    </div>
                    <TabsContent value="preview">
                        { activeFragment && <FragmentWeb data={activeFragment}/> }
                    </TabsContent>
                    <TabsContent value="code" className="min-h-0">
                        {
                            !!activeFragment?.files && (
                                <FileExplorer
                                files={activeFragment.files as {[path: string] : string}}>

                                </FileExplorer>
                            )
                        }
                    </TabsContent>

                    <TabsContent value="selectFragment">
                        <div className="flex justify-center items-center w-full h-full">
                            <div className="text-3xl text-gray-400">
                                Click Fragment to view code or Demo.......
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
        </ResizablePanelGroup>
        </div>
}
