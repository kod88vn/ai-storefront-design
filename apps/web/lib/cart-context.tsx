'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'
import type { CartItem } from '@ai-storefront/types'

interface CartState {
    items: CartItem[]
}

type CartAction =
    | { type: 'ADD'; item: CartItem }
    | { type: 'REMOVE'; productId: string }
    | { type: 'UPDATE_QTY'; productId: string; qty: number }
    | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD': {
            const exists = state.items.find((i) => i.productId === action.item.productId)
            if (exists) {
                return { items: state.items.map((i) => i.productId === action.item.productId ? { ...i, qty: i.qty + 1 } : i) }
            }
            return { items: [...state.items, action.item] }
        }
        case 'REMOVE':
            return { items: state.items.filter((i) => i.productId !== action.productId) }
        case 'UPDATE_QTY':
            if (action.qty <= 0) return { items: state.items.filter((i) => i.productId !== action.productId) }
            return { items: state.items.map((i) => i.productId === action.productId ? { ...i, qty: action.qty } : i) }
        case 'CLEAR':
            return { items: [] }
        default:
            return state
    }
}

interface CartContextValue {
    items: CartItem[]
    addToCart: (productId: string) => void
    removeFromCart: (productId: string) => void
    updateQty: (productId: string, qty: number) => void
    clearCart: () => void
    count: number
    total: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'storefront-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] })

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const parsed = JSON.parse(raw) as CartItem[]
                for (const item of parsed) {
                    dispatch({ type: 'ADD', item })
                }
            }
        } catch {
            // ignore
        }
    }, [])

    // Persist to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
        } catch {
            // ignore
        }
    }, [state.items])

    function addToCart(productId: string) {
        // We need product data to build the CartItem. Import from shared data.
        import('@ai-storefront/storefront-components').then(({ sampleProducts }) => {
            const product = sampleProducts.find((p) => p.id === productId)
            if (!product) return
            dispatch({
                type: 'ADD',
                item: { productId: product.id, title: product.title, price: product.price, image: product.image, qty: 1 },
            })
        })
    }

    function removeFromCart(productId: string) {
        dispatch({ type: 'REMOVE', productId })
    }

    function updateQty(productId: string, qty: number) {
        dispatch({ type: 'UPDATE_QTY', productId, qty })
    }

    function clearCart() {
        dispatch({ type: 'CLEAR' })
    }

    const count = state.items.reduce((s, i) => s + i.qty, 0)
    const total = state.items.reduce((s, i) => s + i.price * i.qty, 0)

    return (
        <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQty, clearCart, count, total }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
