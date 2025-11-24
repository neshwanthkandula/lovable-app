"use client"

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { success } from 'zod'
const page = () => {
  const [value, setvalue] = useState("");
  const trpc = useTRPC();
  const router = useRouter();
  const projects = useMutation(trpc.projects.create.mutationOptions({
    onError : (error)=>{
      toast.error(error.message);
    },
    onSuccess : (data)=>{
      console.log("redirected to project page")
      router.push(`/projects/${data.id}`);
    },
  }));
  
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className=' max-w-7xl mx auto flex items-center flex-col gap-y-4 justify-center'>
        <Input value={value} onChange={(e)=>{
          setvalue(e.target.value)
        }}/>
        <Button disabled={projects.isPending} onClick={()=> projects.mutate({ value : value})}>invoke Background Job</Button>
        
      </div>
    </div>
  )
}

export default page