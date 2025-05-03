export type Overlayable = HTMLInputElement | HTMLTextAreaElement

export type RegisteredOverlayable = {
	overlayable: Overlayable
	id: number
	focused: boolean
	text: string
}

export type OverlayableChangeEvent = {
	focused: boolean
	text: string
}
