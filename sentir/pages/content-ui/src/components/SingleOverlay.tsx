import { Overlayable } from '@extension/shared/lib/types'
import { CSSProperties, useEffect, useMemo, useState } from 'react'

type SingleOverlayProps = {
	overlayable: Overlayable
	lastVisualChangeTime: number
	onResize: (overlayable: Overlayable) => void
}

const SingleOverlay: React.FC<SingleOverlayProps> = ({ overlayable, lastVisualChangeTime, onResize }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			onResize(overlayable)
		})
		resizeObserver.observe(overlayable)
		return () => resizeObserver.disconnect()
	}, [overlayable, onResize])

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.target === overlayable) {
						setIsVisible(entry.isIntersecting)
					}
				})
			},
			{ threshold: 0 },
		)
		observer.observe(overlayable)
		return () => observer.disconnect()
	}, [overlayable])

	const overlayStyle = useMemo<CSSProperties>(() => {
		const style = window.getComputedStyle(overlayable)
		const boundingRect = overlayable.getBoundingClientRect()
		return {
			top: boundingRect?.top,
			left: boundingRect?.left,
			width: boundingRect?.width,
			height: boundingRect?.height,
			padding: style?.padding,
			border: style?.border,
			borderRadius: style?.borderRadius,
			borderColor: 'transparent',
			backgroundColor: 'rgba(20, 200, 200, 0.1)',
			color: style?.color,
			fontSize: style?.fontSize,
			fontWeight: style?.fontWeight,
			letterSpacing: style?.letterSpacing,
			lineHeight: style?.lineHeight,
			overflow: 'hidden',
			transition: style?.transition,
		}
	}, [overlayable, lastVisualChangeTime])

	if (!isVisible) return null

	return (
		<div className="absolute" style={overlayStyle}>
			{overlayable.id}
		</div>
	)
}

export default SingleOverlay
