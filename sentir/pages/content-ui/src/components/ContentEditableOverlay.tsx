import { OverlayableChangeEvent, RegisteredOverlayable } from "@extension/shared/lib/types"

import { Completion } from "sentir-common"

export type ContentEditableOverlayProps = {
	registeredOverlayable: RegisteredOverlayable
	lastVisualChangeTime: number
	onChange: (event: Partial<OverlayableChangeEvent>) => void
	onCompletionAccept: (completion: Completion) => void
	onResize: () => void
}

const ContentEditableOverlay: React.FC<ContentEditableOverlayProps> = ({
	registeredOverlayable,
	lastVisualChangeTime,
	onChange,
	onCompletionAccept,
	onResize,
}) => {
	return <div>ContentEditableOverlay</div>
}
ContentEditableOverlay.displayName = 'ContentEditableOverlay'

export default ContentEditableOverlay
