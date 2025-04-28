import { useEffect, useState } from 'react'
import { Overlayable } from '@extension/shared/lib/types'
import { computeKey, isOverlayable } from '@extension/shared/lib/utils'
import SingleOverlay from '@/components/SingleOverlay'

export default function App() {
	const [overlayables, setOverlayables] = useState<Overlayable[]>([])
	const [lastVisualChangeTime, setLastVisualChangeTime] = useState<number>(0)

	useEffect(() => {
		setOverlayables(Array.from(document.querySelectorAll('input, textarea')))

		const mutationObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				const addedOverlayables: Overlayable[] = Array.from(mutation.addedNodes).filter(isOverlayable)
				const removedOverlayables: Overlayable[] = Array.from(mutation.removedNodes).filter(isOverlayable)
				setOverlayables(prev => {
					const afterRemoved = prev.filter(overlayable => !removedOverlayables.includes(overlayable))
					return [...afterRemoved, ...addedOverlayables]
				})
			})
			setLastVisualChangeTime(Date.now())
		})
		mutationObserver.observe(document.body, { childList: true, subtree: true })

		const resizeObserver = new ResizeObserver(() => {
			setLastVisualChangeTime(Date.now())
		})
		resizeObserver.observe(document.body)

		return () => {
			mutationObserver.disconnect()
			resizeObserver.disconnect()
		}
	}, [])

	return (
		<>
			{overlayables.map(overlayable => (
				<SingleOverlay
					key={computeKey(overlayable)}
					overlayable={overlayable}
					lastVisualChangeTime={lastVisualChangeTime}
					onResize={() => setLastVisualChangeTime(Date.now())}
				/>
			))}
		</>
	)
}
