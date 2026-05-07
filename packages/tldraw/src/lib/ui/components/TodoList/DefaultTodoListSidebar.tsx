import { useContainer, useEditor, usePassThroughWheelEvents, useValue } from '@tldraw/editor'
import classNames from 'classnames'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMenuIsOpen } from '../../hooks/useMenuIsOpen'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiInput } from '../primitives/TldrawUiInput'
import { usePersistedTodoList } from './usePersistedTodoList'

/** @internal */
export const DefaultTodoListSidebar = memo(function DefaultTodoListSidebar() {
	const editor = useEditor()
	const container = useContainer()
	const msg = useTranslation()
	const locale = useValue('locale', () => editor.user.getLocale(), [editor])
	const createdAtFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				dateStyle: 'short',
				timeStyle: 'short',
			}),
		[locale]
	)

	const formatCreatedAt = useCallback(
		(ts: number | undefined) => {
			if (ts === undefined) return null
			return createdAtFormatter.format(ts)
		},
		[createdAtFormatter]
	)
	const [isOpen, onOpenChange] = useMenuIsOpen('todo-sidebar')
	const { items, addItem, toggleDone, removeItem } = usePersistedTodoList(editor.store.id)

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const [draft, setDraft] = useState('')

	useEffect(() => {
		const sidebarEl = ref.current
		if (!sidebarEl || !isOpen) return

		function handlePointerMove(event: PointerEvent) {
			editor.markEventAsHandled(event)
		}

		function handleKeyDown(event: KeyboardEvent) {
			const el = ref.current
			if (!el) return
			if (event.key === 'Escape' && el.contains(editor.getContainerDocument().activeElement)) {
				event.stopPropagation()
				onOpenChange(false)
				editor.getContainer().focus()
			}
		}

		sidebarEl.addEventListener('pointermove', handlePointerMove)
		sidebarEl.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			sidebarEl.removeEventListener('pointermove', handlePointerMove)
			sidebarEl.removeEventListener('keydown', handleKeyDown, { capture: true })
		}
	}, [editor, isOpen, onOpenChange])

	const commitDraft = useCallback(() => {
		addItem(draft)
		setDraft('')
	}, [addItem, draft])

	if (!isOpen) return null

	return createPortal(
		<>
			<div
				role="presentation"
				className="tlui-todo-sidebar__backdrop"
				onClick={() => onOpenChange(false)}
			/>
			<div
				ref={ref}
				className="tlui-todo-sidebar"
				role="dialog"
				aria-label={msg('todo-list.title')}
				onPointerDown={(e) => e.stopPropagation()}
			>
				<div className="tlui-todo-sidebar__header">
					<span className="tlui-todo-sidebar__title">{msg('todo-list.title')}</span>
					<TldrawUiButton
						type="icon"
						title={msg('ui.close')}
						data-testid="todo-list.close"
						onClick={() => onOpenChange(false)}
					>
						<TldrawUiButtonIcon icon="cross-2" small />
					</TldrawUiButton>
				</div>
				<div className="tlui-todo-sidebar__body">
					{items.length === 0 ? (
						<p className="tlui-todo-sidebar__empty">{msg('todo-list.empty')}</p>
					) : (
						<ul className="tlui-todo-sidebar__list">
							{items.map((item) => {
								const createdLabel = formatCreatedAt(item.createdAt)
								return (
									<li key={item.id} className="tlui-todo-sidebar__item">
										<TldrawUiButton
											type="icon"
											title={item.done ? msg('todo-list.mark-todo') : msg('todo-list.mark-done')}
											data-testid="todo-list.toggle-item"
											onClick={() => toggleDone(item.id)}
										>
											<TldrawUiButtonIcon icon={item.done ? 'check' : 'geo-check-box'} small />
										</TldrawUiButton>
										<div className="tlui-todo-sidebar__item-main">
											<span
												className={classNames('tlui-todo-sidebar__item-text', {
													'tlui-todo-sidebar__item-text--done': item.done,
												})}
											>
												{item.text}
											</span>
											{createdLabel ? (
												<span
													className="tlui-todo-sidebar__item-created"
													title={msg('todo-list.created-at')}
												>
													{createdLabel}
												</span>
											) : null}
										</div>
										<TldrawUiButton
											type="icon"
											title={msg('todo-list.remove')}
											data-testid="todo-list.remove-item"
											onClick={() => removeItem(item.id)}
										>
											<TldrawUiButtonIcon icon="trash" small />
										</TldrawUiButton>
									</li>
								)
							})}
						</ul>
					)}
				</div>
				<div className="tlui-todo-sidebar__footer">
					<div className="tlui-todo-sidebar__input-wrap">
						<TldrawUiInput
							value={draft}
							onValueChange={setDraft}
							onComplete={() => commitDraft()}
							placeholder={msg('todo-list.placeholder')}
							aria-label={msg('todo-list.placeholder')}
							data-testid="todo-list.input"
						/>
					</div>
					<TldrawUiButton
						type="icon"
						title={msg('todo-list.add')}
						data-testid="todo-list.add"
						onClick={() => commitDraft()}
					>
						<TldrawUiButtonIcon icon="plus" small />
					</TldrawUiButton>
				</div>
			</div>
		</>,
		container
	)
})
