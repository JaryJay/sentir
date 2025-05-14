import { OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared/lib/types'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { applyCompletion, Completion } from 'sentir-common'

type SingleOverlayProps = {
	registeredOverlayable: RegisteredOverlayable
	lastVisualChangeTime: number
	onChange: (event: Partial<OverlayableChangeEvent>) => void
	onCompletionAccept: (completion: Completion) => void
	onResize: () => void
}

const SingleOverlay: React.FC<SingleOverlayProps> = ({
	registeredOverlayable,
	lastVisualChangeTime,
	onChange,
	onCompletionAccept,
	onResize,
}) => {
	const [isVisible, setIsVisible] = useState(false)
	const [currentCompletionIdx, setCurrentCompletionIdx] = useState(0)
	const [prevSize, setPrevSize] = useState<readonly { inlineSize: number; blockSize: number }[] | null>(null)

	const { overlayable, id } = registeredOverlayable

	/** Call onResize when the overlayable is resized */
	useEffect(() => {
		const resizeObserver = new ResizeObserver(entries => {
			entries.forEach(entry => {
				if (entry.target !== overlayable) return
				// Have to map contextBoxSize to object because it's currently a class instance
				const newSize = entry.contentBoxSize.map(s => ({ inlineSize: s.inlineSize, blockSize: s.blockSize }))
				if (_.isEqual(newSize, prevSize)) return
				setPrevSize(newSize)
				onResize()
			})
		})
		resizeObserver.observe(overlayable)
		return () => resizeObserver.disconnect()
	}, [overlayable, onResize])

	/** Determine when the overlayable is visible */
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.target === overlayable) {
						if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
							setIsVisible(true)
						} else {
							setIsVisible(false)
						}
					}
				})
			},
			// At least 20% of the element should be visible to be considered visible
			{ threshold: 0.2 },
		)
		observer.observe(overlayable)
		return () => observer.disconnect()
	}, [overlayable])

	/** Attach listeners to the overlayable input to detect focus and input events */
	useEffect(() => {
		const handleInput = () => onChange({ text: overlayable.value })
		const handleFocus = () => onChange({ focused: true })
		const handleBlur = () => onChange({ focused: false })

		overlayable.addEventListener('input', handleInput)
		overlayable.addEventListener('focus', handleFocus)
		overlayable.addEventListener('blur', handleBlur)
		return () => {
			overlayable.removeEventListener('input', handleInput)
			overlayable.removeEventListener('focus', handleFocus)
			overlayable.removeEventListener('blur', handleBlur)
		}
	}, [overlayable, onChange])

	/** When completions change, clear the overlayable's placeholder text */
	useEffect(() => {
		if (registeredOverlayable.completions.length > 0) {
			overlayable.classList.add('sentir-placeholder-transparent')
		}
	}, [registeredOverlayable.completions])

	/** When tab is pressed, accept the current completion */
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Tab' && registeredOverlayable.completions.length > 0 && registeredOverlayable.focused) {
				event.preventDefault()
				const oldText = overlayable.value
				const completion = registeredOverlayable.completions[currentCompletionIdx]
				const newText = applyCompletion(oldText, completion)
				overlayable.value = newText
				console.log('Completion accepted. Clearing completions 1')
				onChange({ text: newText })
				onCompletionAccept(completion)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [registeredOverlayable, onChange])

	const positioningStyle = useMemo<CSSProperties>(() => {
		const boundingRect = overlayable.getBoundingClientRect()
		return {
			top: `${boundingRect.top}px`,
			left: `${boundingRect.left}px`,
			width: `${boundingRect.width}px`,
			height: `${boundingRect.height}px`,
		}
	}, [overlayable, lastVisualChangeTime])

	/** Inherit certain CSS properties from the overlayable */
	const inheritedStyle = useMemo<CSSProperties>(() => {
		const style = window.getComputedStyle(overlayable)
		return {
			padding: style.padding,
			paddingInline: style.paddingInline,
			paddingBlock: style.paddingBlock,
			borderWidth: style.borderWidth,
			borderStyle: style.borderStyle,
			borderRadius: style.borderRadius,
			color: style.color,
			fontFamily: style.fontFamily,
			fontSize: style.fontSize,
			fontStyle: style.fontStyle,
			fontWeight: style.fontWeight,
			letterSpacing: style.letterSpacing,
			lineHeight: style.lineHeight,
			transition: style.transition,
		}
	}, [overlayable, lastVisualChangeTime])

	if (!isVisible) return null

	return (
		<div
			id={`sentir-overlay-${id}`}
			className="fixed bg-[#14c8c81a] whitespace-pre-wrap z-10000"
			style={positioningStyle}>
			<div
				id={`sentir-overlay-content-${id}`}
				className="border-transparent whitespace-pre-wrap overflow-hidden"
				style={inheritedStyle}>
				{registeredOverlayable.completions.length === 0 ? (
					overlayable.value
				) : (
					<CompletionText
						currentText={overlayable.value}
						completion={registeredOverlayable.completions[currentCompletionIdx]}
					/>
				)}
			</div>
			{registeredOverlayable.completions.length > 0 && (
				<CompletionFloatingBox
					currentText={overlayable.value}
					completion={registeredOverlayable.completions[currentCompletionIdx]}
				/>
			)}
		</div>
	)
}

const CompletionText: React.FC<{
	currentText: string
	completion: Completion
}> = ({ currentText, completion }) => {
	switch (completion.completionType) {
		case 'insert': {
			const { textToInsert, index } = completion
			return (
				<>
					{currentText.slice(0, index)}
					<span className="text-current/50 italic">{textToInsert}</span>
					{currentText.slice(index)}
				</>
			)
		}
		case 'replace': {
			const { textToInsert, index, endIndex } = completion
			return (
				<>
					{currentText.slice(0, index)}
					<span className="bg-red-400/30 rounded-xs">{currentText.slice(index, endIndex)}</span>
					{currentText.slice(endIndex)}
				</>
			)
		}
		case 'noop': {
			return currentText
		}
		default: {
			throw new Error(`Invalid text completion diff category`)
		}
	}
}

const CompletionFloatingBox: React.FC<{
	currentText: string
	completion: Completion
}> = ({ currentText, completion }) => {
	if (completion.completionType !== 'replace') {
		return null
	}

	const { textToInsert, index, endIndex } = completion
	if (!textToInsert) {
		return null
	}

	return (
		<div className="absolute left-[calc(100%+0.5rem)] top-0 min-w-40 max-w-64 px-2 py-1 border border-current/50 box-border">
			<span className="bg-green-400/30 rounded-xs">{textToInsert}</span>
		</div>
	)
}

export default SingleOverlay
