import { useMenuIsOpen } from '../../hooks/useMenuIsOpen'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'

/** @internal */
export function TodoListSidebarButton() {
	const msg = useTranslation()
	const [isOpen, onOpenChange] = useMenuIsOpen('todo-sidebar')

	return (
		<TldrawUiButton
			type="icon"
			data-testid="todo-list.button"
			title={msg('todo-list.toggle')}
			aria-expanded={isOpen}
			aria-haspopup="dialog"
			onClick={() => onOpenChange(!isOpen)}
		>
			<TldrawUiButtonIcon icon="list" small />
		</TldrawUiButton>
	)
}
