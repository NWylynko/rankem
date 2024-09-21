"use client"

import { produce } from 'immer'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

type RankItem = {
  id: string
  name: string
  betterThan: string[]
  worseThan: string[]
  score: number
}

type Store = {
  loading: boolean
  ranks: {
    id: string
    name: string
    items: RankItem[]
  }[],
  showSorted: boolean
  createRank: (name: string) => void
  deleteRank: (id: string) => void
  addItem: (rankId: string, name: string) => void
  removeItem: (rankId: string, itemId: string) => void
  addBetterThanItem: (rankId: string, itemId: string, id: string) => void
  addWorseThanItem: (rankId: string, itemId: string, id: string) => void
  removeBetterThanItem: (rankId: string, itemId: string, id: string) => void
  removeWorseThanItem: (rankId: string, itemId: string, id: string) => void
  calculateScores: (rankId: string) => void
}

const getNewId = () => crypto.randomUUID()

const createAppStore = () => {
  const Store = createStore<Store>()(
    persist(
      (set, get) => ({
        loading: true,
        ranks: [],
        showSorted: false,
        createRank: (name) => {
          set(
            produce(get(), (state) => {
              state.ranks.push({
                id: getNewId(),
                name,
                items: [],
              })
            }),
          )
        },
        deleteRank: (id) => {
          set(produce(get(), (state) => {
            const index = state.ranks.findIndex((rank) => rank.id === id)

            if (index === -1) {
              throw new Error('Rank not found')
            }

            state.ranks.splice(index, 1)
          }))
        },
        addItem: (rankId, name) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            selectedRank.items.push({
              id: getNewId(),
              name,
              betterThan: [],
              worseThan: [],
              score: 0,
            })
          }))
        },
        removeItem: (rankId, itemId) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            const index = selectedRank.items.findIndex((item) => item.id === itemId)

            if (index === -1) {
              throw new Error('Item not found')
            }

            selectedRank.items.splice(index, 1)
          }))
        },
        addBetterThanItem: (rankId, itemId, id) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            const selectedItem = selectedRank.items.find((item) => item.id === itemId)

            if (selectedItem === undefined) {
              throw new Error('Item not found')
            }

            selectedItem.betterThan.push(id)
          }))
        },
        addWorseThanItem: (rankId, itemId, id) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            const selectedItem = selectedRank.items.find((item) => item.id === itemId)

            if (selectedItem === undefined) {
              throw new Error('Item not found')
            }

            selectedItem.worseThan.push(id)
          }))
        },
        removeBetterThanItem: (rankId, itemId, id) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            const selectedItem = selectedRank.items.find((item) => item.id === itemId)

            if (selectedItem === undefined) {
              throw new Error('Item not found')
            }

            selectedItem.betterThan = selectedItem.betterThan.filter((item) => item !== id)
          }))
        },
        removeWorseThanItem: (rankId, itemId, id) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find((rank) => rank.id === rankId)

            if (selectedRank === undefined) {
              throw new Error('Rank not found')
            }

            const selectedItem = selectedRank.items.find((item) => item.id === itemId)

            if (selectedItem === undefined) {
              throw new Error('Item not found')
            }

            selectedItem.worseThan = selectedItem.worseThan.filter((item) => item !== id)
          }))
        },
        calculateScores: (rankId: string) => {
          set(produce(get(), (state) => {
            const selectedRank = state.ranks.find(rank => rank.id === rankId);

            if (!selectedRank) {
              throw new Error('Rank not found');
            }

            const items = selectedRank.items;

            // Step 1: Reset all scores to 1000
            items.forEach(item => {
              item.score = 1000;
            });

            // Perform pairwise comparisons based on "betterThan" and "worseThan"
            items.forEach(item => {
              item.betterThan.forEach(betterItemId => {
                const betterItem = items.find(i => i.id === betterItemId);
                if (betterItem) {
                  // Item should be better than the other item, so outcome is 1 for item and 0 for betterItem
                  calculateElo(item, betterItem, 1);
                }
              });

              item.worseThan.forEach(worseItemId => {
                const worseItem = items.find(i => i.id === worseItemId);
                if (worseItem) {
                  // Item should be worse than the other item, so outcome is 0 for item and 1 for worseItem
                  calculateElo(item, worseItem, 0);
                }
              });
            });

            state.showSorted = true;
          }));
        }
      }),
      {
        name: 'rankem',
        version: 0,
      }
    ),
  )
  return Store
}

const context = createContext<ReturnType<typeof createAppStore> | null>(null)

export const StoreProvider = (props: PropsWithChildren) => {
  const [store] = useState(() => createAppStore())

  useEffect(() => {
    store.setState({ loading: false })
  }, [])

  return (
    <context.Provider value={store} >
      {props.children}
    </context.Provider>
  )
}

export const useAppStore = <U,>(selector: (state: Store) => U): U => {
  const store = useContext(context)

  if (store === null) {
    throw new Error('trying to call useStore outside of <StoreProvider />')
  }

  return useStore<ReturnType<typeof createAppStore>, U>(store, selector)
}

const K = 32; // This is the Elo adjustment factor, you can adjust based on how fast you want scores to change

const calculateElo = (itemA: RankItem, itemB: RankItem, outcome: 1 | 0) => {
  // Calculate expected outcome
  const ratingA = itemA.score;
  const ratingB = itemB.score;

  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  // Update ratings based on actual outcome
  itemA.score = ratingA + K * (outcome - expectedA);
  itemB.score = ratingB + K * ((1 - outcome) - expectedB);
};
