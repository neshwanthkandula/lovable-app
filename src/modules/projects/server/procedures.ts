import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { prisma } from "../../../../lib/prisma";
import { inngest } from '@/inngest/client';
import { generateSlug } from "random-word-slugs"
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne : protectedProcedure
    .input(z.object({
        id : z.string().min(1, {message : "id is required"})
    }))
    .query(async({ input,ctx })=>{
        const exsistingProject = await prisma.project.findUnique({
            where : {
                id : input.id,
                userId : ctx.auth.userId
            }
        })


        if(!exsistingProject){
            throw new TRPCError({ code : "NOT_FOUND", message : "Project not found"});
        }

        return exsistingProject;
    }),

    getMany : protectedProcedure
    .query(async ({ ctx })=>{
        const projects = await prisma.project.findMany({
            where :{
                userId : ctx.auth.userId
            },
            orderBy : {
                updatedAt : "desc"
            }
        })

        return projects;
    }),

    create: protectedProcedure
    .input(
        z.object({
            value : z.string()
            .min(1, { message : "message is required"})
            .max(10000, { message : "value is too long"}),
        }),
    )

    .mutation(async ({input , ctx})=>{
        const createdproject = await prisma.project.create({
            data : {
                userId : ctx.auth.userId,
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