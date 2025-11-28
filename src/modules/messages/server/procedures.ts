import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { inngest } from '@/inngest/client';
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init"

export const meassagesRouter = createTRPCRouter({
    getMany : protectedProcedure
    .input(
        z.object({
            projectId : z.string().min(1, { message : "projectId is required"}),
        }),
    )
    .query(async ({ input, ctx })=>{
        const messages = await prisma.message.findMany({
            where : {
                projectId : input.projectId,
                project : {
                    userId : ctx.auth.userId
                }
            },
            include : {
                fragment : true
            },
            orderBy : {
                updatedAt : "asc"
            }
        })


        return messages;
    }),

    create: protectedProcedure
    .input(
        z.object({
            value : z.string().min(1, { message : "message is required"}),
            projectId : z.string().min(1, { message : "projectId is required"}),
        }),
    )

    .mutation(async ({input, ctx})=>{
        const exsistingProject = await prisma.project.findUnique({
            where :{
                id : input.projectId,
                userId : ctx.auth.userId
            },
        });

        if(!exsistingProject){
            throw new TRPCError({ code:"NOT_FOUND", message: "Project not found"});
        }
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