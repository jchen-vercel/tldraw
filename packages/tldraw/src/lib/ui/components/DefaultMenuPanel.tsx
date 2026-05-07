import { useEditor, usePassThroughWheelEvents, useValue } from '@tldraw/editor'
import { memo, useRef } from 'react'
import { PORTRAIT_BREAKPOINT } from '../constants'
import { useBreakpoint } from '../context/breakpoints'
import { useTldrawUiComponents } from '../context/components'
import { useReadonly } from '../hooks/useReadonly'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { TldrawUiRow } from './primitives/layout'
import { TldrawUiToolbar } from './primitives/TldrawUiToolbar'
import { DefaultTodoListSidebar } from './TodoList/DefaultTodoListSidebar'
import { TodoListSidebarButton } from './TodoList/TodoListSidebarButton'

/** @public @react */
export const DefaultMenuPanel = memo(function MenuPanel() {
	const breakpoint = useBreakpoint()
	const msg = useTranslation()

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const { MainMenu, QuickActions, ActionsMenu, PageMenu } = useTldrawUiComponents()

	const editor = useEditor()
	const isReadonlyMode = useReadonly()
	const isSinglePageMode = useValue('isSinglePageMode', () => editor.options.maxPages <= 1, [
		editor,
	])

	const showQuickActions =
		editor.options.actionShortcutsLocation === 'menu'
			? true
			: editor.options.actionShortcutsLocation === 'toolbar'
				? false
				: breakpoint >= PORTRAIT_BREAKPOINT.TABLET

	const showTodoList = !isReadonlyMode

	if (!MainMenu && !PageMenu && !showQuickActions && !showTodoList) return null

	return (
		<nav ref={ref} className="tlui-menu-zone">
			<TldrawUiRow>
				{MainMenu && <MainMenu />}
				{PageMenu && !isSinglePageMode && <PageMenu />}
				{showQuickActions ? (
					<TldrawUiToolbar orientation="horizontal" label={msg('actions-menu.title')}>
						{QuickActions && <QuickActions />}
						{ActionsMenu && <ActionsMenu />}
					</TldrawUiToolbar>
				) : null}
				{showTodoList ? (
					<>
						<TodoListSidebarButton />
						<DefaultTodoListSidebar />
					</>
				) : null}
			</TldrawUiRow>
		</nav>
	)
})
