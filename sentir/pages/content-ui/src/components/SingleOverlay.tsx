import { Overlayable, OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared/lib/types'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'

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
			top: boundingRect.top,
			left: boundingRect.left,
			width: boundingRect.width,
			height: boundingRect.height,
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

	/** Attach listeners to the overlayable input */
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
	}, [overlayable])

	if (!isVisible) return null
	return (
		<div
			id={`sentir-overlay-${id}`}
			className="fixed bg-[#14c8c81a] border-transparent overflow-hidden"
			style={overlayStyle}>
			{registeredOverlayable.completions[currentCompletionIdx]}
		</div>
	)
}

export default SingleOverlay
