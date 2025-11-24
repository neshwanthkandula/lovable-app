interface Props{
    params : Promise<{
        projectId : string
    }>
}

export const page = async ({ params } : Props)=>{
    const { projectId} = await params;
    return(
        <div>
            project id : {projectId }
        </div>
    )
}