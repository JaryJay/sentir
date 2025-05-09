import { Completion } from "sentir-common";

export type Overlayable = HTMLInputElement | HTMLTextAreaElement;

export type RegisteredOverlayable = {
	overlayable: Overlayable
	id: number
	focused: boolean
	text: string
	completions: Completion[]
	completionsTimestamp: number
}

export type OverlayableChangeEvent = {
	focused: boolean
	text: string
}
