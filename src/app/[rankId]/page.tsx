"use client"

import { ArrowLeftIcon, CalculatorIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useAppStore } from "../store"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Fragment } from "react"
import { notFound, useRouter } from "next/navigation"
import type { Viewport } from 'next'

type PageProps = {
  params: {
    rankId: string
  }
}

const useRank = (rankId: string) => {
  const rank = useAppStore((state) => state.ranks.find((rank) => rank.id === rankId))

  if (rank === undefined) {
    console.error('Rank not found')
    notFound()
  }

  return rank
}

export const viewport: Viewport = {
  themeColor: '#ec4899'
}

export default function RankPage(props: PageProps) {
  const { params } = props

  return (
    <main className="min-h-svh">
      <RankName rankId={params.rankId} />
      <AddNewRankItem rankId={params.rankId} />
      <Items rankId={params.rankId} />
      <CalculateRanking rankId={params.rankId} />
    </main>
  )
}

const RankName = (props: { rankId: string }) => {
  const rank = useRank(props.rankId)
  const deleteItem = useAppStore((state) => state.deleteRank)
  const router = useRouter()

  return (
    <div className="p-2 flex flex-row gap-2 w-full items-center cursor-pointer bg-pink-500 text-white">
      <Link href="/" className="p-2 m-2 text-white border-2 border-white rounded shadow"><ArrowLeftIcon size={18} /></Link>
      <h1 className="uppercase text-xl w-full">{rank.name}</h1>
      {/* <button
        type="button"
        onClick={() => {
          router.push('/')
          deleteItem(props.rankId)
        }}
        className="p-2 m-2 text-white border-2 border-white rounded shadow"><Trash2Icon size={18} /></button> */}
    </div>
  )
}


const AddNewRankItem = (props: { rankId: string }) => {
  const addRankItem = useAppStore((state) => state.addItem)
  const hideRanking = useAppStore((state) => state.hideRanking)

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
    addRankItem(props.rankId, data.name)
    hideRanking(props.rankId)
    form.reset()
  })

  return (
    <form onSubmit={handleSubmit} className="p-2 my-8 flex flex-row gap-2">
      <input type="text" placeholder="Item" {...form.register('name')} className="p-2 m-2 text-[16px] border-2 border-black rounded w-full shadow" autoFocus />
      <button type="submit" className="p-2 m-2 text-green-400 border-2 border-green-400 rounded shadow flex gap-1 items-center"><PlusIcon size={18} /> Add</button>
    </form>
  )
}

const Items = (props: { rankId: string }) => {
  const rank = useRank(props.rankId)
  const showSorted = useAppStore((state) => state.ranks.find(rank => rank.id === props.rankId)?.showSorted)

  const sortedItems = showSorted ? rank.items.toSorted((a, b) => b.score - a.score) : rank.items


  return (
    <div className="flex flex-col gap-2 m-2">
      {sortedItems.map((item, index) => (
        <Fragment key={item.id}>
          <Link href={`/${props.rankId}/${item.id}`} className="p-2 flex flex-row gap-2 w-full items-center cursor-pointer">
            {showSorted ? <span className="w-full">{index + 1}. {item.name}</span> : <span className="w-full">{item.name}</span>}
            {/* <span>{item.score}</span> */}
          </Link>
          {index !== sortedItems.length - 1 && <div className="border-t-2 border-black opacity-85 w-full" />}
        </Fragment>
      ))}
    </div>
  )
}

const CalculateRanking = (props: { rankId: string }) => {
  const calculateScores = useAppStore((state) => state.calculateScores)
  const showSorted = useAppStore((state) => state.ranks.find(rank => rank.id === props.rankId)?.showSorted)

  return (
    <div className="absolute bottom-16 w-full flex items-center justify-center">
      <button type="button" onClick={() => {
        calculateScores(props.rankId)
      }} className="py-3 px-4 flex flex-row gap-2 items-center cursor-pointer bg-orange-500 text-white rounded-3xl shadow shadow-orange-500">
        {showSorted ? 'Recalculate Ranking' : 'Calculate Ranking'} <CalculatorIcon size={18} />
      </button>
    </div>
  )
}