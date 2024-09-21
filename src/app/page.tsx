"use client"

import { z } from "zod"
import { useAppStore } from "./store"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment } from "react"
import { PlusIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a855f7' },
    { media: '(prefers-color-scheme: dark)', color: '#a855f7' },
  ],
}

export default function HomePage() {
  return (
    <main className="min-h-svh">
      <h1 className="text-2xl p-4 bg-purple-500 text-white">Rankem</h1>
      <RankItems />
      <AddNewRank />
    </main>
  )
}

const RankItems = () => {
  const ranks = useAppStore((state) => state.ranks)

  return (
    <div className="flex flex-col gap-2">
      {ranks.map((rank, index) => (
        <Fragment key={rank.id}>
          <Link href={`/${rank.id}`} className="p-2 flex flex-row gap-2 w-full items-center cursor-pointer">
            <span className="uppercase text-xl w-full">{rank.name}</span>
            <Link href={`/${rank.id}`}
              className="p-2 m-2 text-pink-500 border-2 border-pink-500 rounded shadow"><ArrowRightIcon size={18} /></Link>
          </Link>
          {index !== ranks.length - 1 && <div className="border-t-2 border-black opacity-85 w-full" />}
        </Fragment>
      ))}
    </div>
  )
}

const AddNewRank = () => {
  const createNewRank = useAppStore((state) => state.createRank)

  const schema = z.object({
    name: z.string().min(1).max(50)
  })

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      name: ''
    },
    resolver: zodResolver(schema)
  })

  const handleSubmit = form.handleSubmit((data) => {
    createNewRank(data.name)
    form.reset()
  })

  return (
    <form onSubmit={handleSubmit} className="p-2 border-t-2 border-black flex flex-row gap-2 absolute bottom-0 bg-white w-full">
      <input type="text" placeholder="Name" {...form.register('name')} className="p-2 m-2 text-[16px] border-2 border-black rounded w-full shadow" />
      <button type="submit" className="p-2 m-2 text-green-400 border-2 border-green-400 rounded shadow flex gap-1 items-center"><PlusIcon size={18} /> Create</button>
    </form>
  )
}