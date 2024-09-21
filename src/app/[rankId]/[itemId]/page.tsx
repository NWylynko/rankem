"use client"

import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"
import { useAppStore } from "../../store"
import { notFound, useRouter } from "next/navigation"
import type { Viewport } from 'next'

type PageProps = {
  params: {
    rankId: string
    itemId: string
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

const useRankItem = (rankId: string, itemId: string) => {
  const item = useAppStore((state) => state.ranks.find((rank) => rank.id === rankId)?.items.find((item) => item.id === itemId))

  if (item === undefined) {
    console.error('Item not found')
    notFound()
  }

  return item
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#06b6d4' },
    { media: '(prefers-color-scheme: dark)', color: '#06b6d4' },
  ],
}

export default function RankPage(props: PageProps) {
  const { params } = props

  return (
    <main className="min-h-svh">
      <RankItemName rankId={params.rankId} itemId={params.itemId} />
      <Items rankId={params.rankId} itemId={params.itemId} />
      <QuickAdd rankId={params.rankId} />
    </main>
  )
}

const RankItemName = (props: { rankId: string, itemId: string }) => {
  const item = useRankItem(props.rankId, props.itemId)
  const removeItem = useAppStore((state) => state.removeItem)
  const router = useRouter()

  return (
    <div className="p-2 flex flex-row gap-2 w-full items-center cursor-pointer bg-cyan-500 text-white">
      <Link href={`/${props.rankId}`} className="p-2 m-2 text-white border-2 border-white rounded shadow"><ArrowLeftIcon size={18} /></Link>
      <h1 className="uppercase text-xl w-full">{item.name}</h1>
      {/* <button
        type="button"
        onClick={() => {
          router.push(`/${props.rankId}`)
          removeItem(props.rankId, props.itemId);
        }}
        className="p-2 m-2 text-white border-2 border-white rounded shadow"><Trash2Icon size={18} /></button> */}
    </div>
  )
}

const Items = (props: { rankId: string, itemId: string }) => {
  const rank = useRank(props.rankId)
  const selectedItem = useRankItem(props.rankId, props.itemId)
  const addBetterThanItem = useAppStore((state) => state.addBetterThanItem)
  const addWorseThanItem = useAppStore((state) => state.addWorseThanItem)
  const removeBetterThanItem = useAppStore((state) => state.removeBetterThanItem)
  const removeWorseThanItem = useAppStore((state) => state.removeWorseThanItem)

  const itemsWithoutSelf = rank.items
    .filter((item) => item.id !== props.itemId)
    .map((item) => ({
      ...item,
      isBetter: selectedItem.betterThan.includes(item.id),
      isWorse: selectedItem.worseThan.includes(item.id),
    }))

  return (
    <div className="flex flex-col gap-2 m-2">
      {itemsWithoutSelf.map((item, index) => (
        <Fragment key={item.id}>
          <div className="p-2 flex flex-row gap-2 w-full items-center cursor-pointer">
            <span className="w-full">{item.name}</span>
            <button
              data-enabled={item.isBetter}
              className="flex items-center gap-1 mx-2 border-2 border-green-300 data-[enabled=true]:border-green-400 text-green-400 data-[enabled=true]:text-white data-[enabled=true]:bg-green-400 rounded py-1 px-2 transition-colors"
              type="button"
              onClick={() => {
                if (item.isBetter) {
                  removeBetterThanItem(props.rankId, props.itemId, item.id)
                } else {
                  addBetterThanItem(props.rankId, props.itemId, item.id)
                  removeWorseThanItem(props.rankId, props.itemId, item.id)
                }
              }}
            >Better <ArrowUpIcon size={18} /></button>
            <button
              data-enabled={item.isWorse}
              className="flex items-center gap-1 mx-2 border-2 border-red-300 data-[enabled=true]:border-red-400 text-red-400 data-[enabled=true]:text-white data-[enabled=true]:bg-red-400  rounded py-1 px-2 transition-colors"
              type="button"
              onClick={() => {
                if (item.isWorse) {
                  removeWorseThanItem(props.rankId, props.itemId, item.id)
                } else {
                  addWorseThanItem(props.rankId, props.itemId, item.id)
                  removeBetterThanItem(props.rankId, props.itemId, item.id)
                }
              }}
            >Worse <ArrowDownIcon size={18} /></button>
          </div>
          {index !== itemsWithoutSelf.length - 1 && <div className="border-t-2 border-black opacity-85 w-full" />}
        </Fragment>
      ))}
    </div>
  )
}

const QuickAdd = (props: { rankId: string }) => {
  return (
    <div className="absolute bottom-32 w-full flex items-center justify-center">
      <Link href={`/${props.rankId}`} className="p-2 flex flex-row gap-2 items-center cursor-pointer bg-pink-500 text-white rounded-3xl shadow shadow-pink-500">
        Quick Add <PlusIcon size={18} />
      </Link>
    </div>
  )
}