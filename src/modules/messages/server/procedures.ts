import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { inngest } from '@/inngest/client';

export const meassagesRouter = createTRPCRouter({
    getMany : baseProcedure
    .query(async ()=>{
        const messages = await prisma.message.findMany({
            orderBy : {
                updatedAt : "desc"
            }
        })

        return messages;
    }),

    create: baseProcedure
    .input(
        z.object({
            value : z.string().min(1, { message : "message is required"}),
        }),
    )

    .mutation(async ({input})=>{
        const createdMessage = await prisma.message.create({
            data : {
                content : input.value,
                role : "USER",
                type : "RESULT"

            }
        })

        await inngest.send({
            name : "test/hello.world",
            data : {
                email : input.value,
            }
        })
    
        return createdMessage;
    })
})