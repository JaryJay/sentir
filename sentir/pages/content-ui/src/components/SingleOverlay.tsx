import { Overlayable, OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared/lib/types'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { stringDiff, StringDiffResult } from '@extension/shared/lib/utils'

type SingleOverlayProps = {
	registeredOverlayable: RegisteredOverlayable
	lastVisualChangeTime: number
	onChange: (event: Partial<OverlayableChangeEvent>) => void
	onResize: () => void
}

const SingleOverlay: React.FC<SingleOverlayProps> = ({
	registeredOverlayable,
	lastVisualChangeTime,
	onChange,
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

	/** Inherit certain CSS properties from the overlayable */
	const overlayStyle = useMemo<CSSProperties>(() => {
		const style = window.getComputedStyle(overlayable)
		const boundingRect = overlayable.getBoundingClientRect()
		return {
			top: `${boundingRect.top}px`,
			left: `${boundingRect.left}px`,
			width: `${boundingRect.width}px`,
			height: `${boundingRect.height}px`,
			padding: style.padding,
			borderWidth: style.borderWidth,
			borderStyle: style.borderStyle,
			borderRadius: style.borderRadius,
			color: style.color,
			fontSize: style.fontSize,
			fontWeight: style.fontWeight,
			letterSpacing: style.letterSpacing,
			lineHeight: style.lineHeight,
			transition: style.transition,
			zIndex: style.zIndex,
		}
	}, [overlayable, lastVisualChangeTime])

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

	/** When tab is pressed, accept the current completion */
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Tab' && registeredOverlayable.completions.length > 0) {
				event.preventDefault()
				overlayable.value = registeredOverlayable.completions[currentCompletionIdx]
				onChange({ text: registeredOverlayable.completions[currentCompletionIdx] })
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [registeredOverlayable, onChange])

	if (!isVisible) return null

	if (registeredOverlayable.completions.length === 0) {
		return (
			<div
				id={`sentir-overlay-${id}`}
				className="fixed bg-[#14c8c81a] border-transparent overflow-hidden"
				style={overlayStyle}></div>
		)
	}

	const textCompletionDiff = stringDiff(overlayable.value, registeredOverlayable.completions[currentCompletionIdx])
	return (
		<div
			id={`sentir-overlay-${id}`}
			className="fixed bg-[#14c8c81a] border-transparent overflow-hidden"
			style={overlayStyle}>
			<CompletionText
				currentText={overlayable.value}
				completion={registeredOverlayable.completions[currentCompletionIdx]}
				textCompletionDiff={textCompletionDiff}
			/>
		</div>
	)
}

const CompletionText: React.FC<{
	currentText: string
	completion: string
	textCompletionDiff: StringDiffResult
}> = ({ currentText, completion, textCompletionDiff }) => {
	switch (textCompletionDiff.category) {
		case 'equal': {
			return completion
		}
		case 'insert': {
			const { textToInsert, index } = textCompletionDiff
			return (
				<>
					{currentText.slice(0, index)}
					<span className="text-inherit/50 italic">{textToInsert}</span>
					{currentText.slice(index)}
				</>
			)
		}
		case 'delete': {
			const { index, endIndex } = textCompletionDiff
			return (
				<>
					{currentText.slice(0, index)}
					<span className="bg-red-400/30 rounded-sm">{currentText.slice(index, endIndex)}</span>
					{currentText.slice(endIndex)}
				</>
			)
		}
		case 'mixed': {
			const { index, endIndex } = textCompletionDiff
			return (
				<>
					{currentText.slice(0, index)}
					<span className="bg-red-400/30 rounded-sm">{currentText.slice(index, endIndex)}</span>
					{currentText.slice(endIndex)}

					<div className="absolute -right-4 top-0 translate-x-full rounded-sm text-inherit/50 italic">
						{textCompletionDiff.textToInsert}
					</div>
				</>
			)
		}
		default: {
			throw new Error(`Invalid text completion diff category`)
		}
	}
}

export default SingleOverlay
