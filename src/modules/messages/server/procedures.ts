import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { inngest } from '@/inngest/client';
import { TRPCError } from "@trpc/server";

export const meassagesRouter = createTRPCRouter({
    getMany : baseProcedure
    .input(
        z.object({
            projectId : z.string().min(1, { message : "projectId is required"}),
        }),
    )
    .query(async ({ input })=>{
        console.log("messages ***** " + input.projectId);
        const messages = await prisma.message.findMany({
            where : {
                projectId : input.projectId
            },
            include : {
                fragment : true
            },
            orderBy : {
                updatedAt : "asc"
            }
        })

        console.log("messages result" , messages)

        return messages;
    }),

    create: baseProcedure
    .input(
        z.object({
            value : z.string().min(1, { message : "message is required"}),
            projectId : z.string().min(1, { message : "projectId is required"}),
        }),
    )

    .mutation(async ({input})=>{
        const createdMessage = await prisma.message.create({
            data : {
                content : input.value,
                role : "USER",
                type : "RESULT",
                projectId : input.projectId
            }
        })

        await inngest.send({
            name : "test/hello.world",
            data : {
                value : input.value,
                projectId : input.projectId
            }
        })
    
        return createdMessage;
    })
})