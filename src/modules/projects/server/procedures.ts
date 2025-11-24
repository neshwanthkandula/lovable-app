import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { inngest } from '@/inngest/client';
import { generateSlug } from "random-word-slugs"

export const projectsRouter = createTRPCRouter({
    getMany : baseProcedure
    .query(async ()=>{
        const projects = await prisma.project.findMany({
            orderBy : {
                updatedAt : "desc"
            }
        })

        return projects;
    }),

    create: baseProcedure
    .input(
        z.object({
            value : z.string()
            .min(1, { message : "message is required"})
            .max(10000, { message : "value is too long"}),
        }),
    )

    .mutation(async ({input})=>{
        const createdproject = await prisma.project.create({
            data : {
                name : generateSlug(2, {
                    format : "kebab",
                }),
                messages : {
                    create:{
                        content : input.value,
                        role : "USER",
                        type : "RESULT"
                    }
                }
            }
        })

        await inngest.send({
            name : "test/hello.world",
            data : {
                value : input.value,
                projectId  : createdproject.id
            }
        })
    
        return createdproject;
    })
})