"use client"

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
const page = () => {
  const [value, setvalue] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}))
  return (
    <div >
      <Input value={value} onChange={(e)=>{
        setvalue(e.target.value)
      }}/>
      <Button onClick={()=> invoke.mutate({ value : value})}>invoke Background Job</Button>
    </div>
  )
}

export default page