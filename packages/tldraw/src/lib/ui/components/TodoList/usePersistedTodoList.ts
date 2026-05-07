import { uniqueId } from '@tldraw/editor'
import { useCallback, useEffect, useMemo, useState } from 'react'

/** @internal */
export interface TodoListItem {
	id: string
	text: string
	done: boolean
	/** Unix ms when the item was created. Older stored items may omit this. */
	createdAt?: number
}

const STORAGE_PREFIX = 'tldraw-todo-list-v1-'

function safeParse(raw: string | null): TodoListItem[] {
	if (!raw) return []
	try {
		const data = JSON.parse(raw) as unknown
		if (!Array.isArray(data)) return []
		const items: TodoListItem[] = []
		for (const row of data) {
			if (
				row &&
				typeof row === 'object' &&
				'id' in row &&
				'text' in row &&
				'done' in row &&
				typeof (row as TodoListItem).id === 'string' &&
				typeof (row as TodoListItem).text === 'string' &&
				typeof (row as TodoListItem).done === 'boolean'
			) {
				const createdAt =
					'createdAt' in row &&
					typeof (row as TodoListItem).createdAt === 'number' &&
					Number.isFinite((row as TodoListItem).createdAt)
						? (row as TodoListItem).createdAt
						: undefined
				items.push({
					id: (row as TodoListItem).id,
					text: (row as TodoListItem).text,
					done: (row as TodoListItem).done,
					...(createdAt !== undefined ? { createdAt } : {}),
				})
			}
		}
		return items
	} catch {
		return []
	}
}

function loadFromStorage(storageKey: string): TodoListItem[] {
	if (typeof localStorage === 'undefined') return []
	try {
		return safeParse(localStorage.getItem(storageKey))
	} catch {
		return []
	}
}

function saveToStorage(storageKey: string, items: TodoListItem[]) {
	if (typeof localStorage === 'undefined') return
	try {
		localStorage.setItem(storageKey, JSON.stringify(items))
	} catch {
		// ignore quota / private mode
	}
}

/** @internal */
export function usePersistedTodoList(storeId: string) {
	const storageKey = useMemo(() => `${STORAGE_PREFIX}${storeId}`, [storeId])

	const [items, setItems] = useState<TodoListItem[]>(() => loadFromStorage(storageKey))

	useEffect(() => {
		setItems(loadFromStorage(storageKey))
	}, [storageKey])

	useEffect(() => {
		saveToStorage(storageKey, items)
	}, [storageKey, items])

	const addItem = useCallback((text: string) => {
		const trimmed = text.trim()
		if (!trimmed) return
		setItems((prev) => [
			...prev,
			{ id: uniqueId(), text: trimmed, done: false, createdAt: Date.now() },
		])
	}, [])

	const toggleDone = useCallback((id: string) => {
		setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
	}, [])

	const removeItem = useCallback((id: string) => {
		setItems((prev) => prev.filter((item) => item.id !== id))
	}, [])

	return { items, addItem, toggleDone, removeItem }
}
