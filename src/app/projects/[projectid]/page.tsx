import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Projectview } from "@/modules/projects/ui/views/project-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface Props{
    params : Promise<{
        projectid : string
    }>
}

const page = async ({ params } : Props)=>{
    const { projectid } = await params;
    
    const queryClient = await getQueryClient();

    // void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
    //     projectId : projectid
    // }))

    // void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
    //     id : projectid
    // }))
    return(
        <HydrationBoundary state = { dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Loading....</p>}>
                <Suspense fallback={<p>Loading..</p>}>
                <Projectview projectId={projectid}/>
                </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    )
}

export default page;