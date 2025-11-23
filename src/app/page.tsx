"use client"

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
const page = () => {
  const [value, setvalue] = useState("");
  const trpc = useTRPC();
  const { data :  messages } = useQuery(trpc.messages.getMany.queryOptions()) 
  const createMessage = useMutation(trpc.messages.create.mutationOptions({}))
  return (
    <div >
      <Input value={value} onChange={(e)=>{
        setvalue(e.target.value)
      }}/>
      <Button onClick={()=> createMessage.mutate({ value : value})}>invoke Background Job</Button>
      <div>
        {JSON.stringify(messages)}
      </div>
    </div>
  )
}

export default page