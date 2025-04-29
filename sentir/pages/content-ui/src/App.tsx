import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Overlayable } from '@extension/shared/lib/types'
import { computeKey, isOverlayable } from '@extension/shared/lib/utils'
import SingleOverlay from '@/components/SingleOverlay'

function registerOverlayable(
	overlayable: Overlayable,
	nextId: number,
	setNextIdCache: (nextId: number) => void,
): number {
	console.log('registering', overlayable)
	if (!overlayable.classList.contains('sentir-registered')) {
		overlayable.classList.add(`sentir-o-${nextId}`, 'sentir-registered')
		setNextIdCache(nextId + 1)
		return nextId + 1
	}
	return nextId
}

export default function App() {
	const [overlayables, setOverlayables] = useState<Overlayable[]>([])
	const [lastVisualChangeTime, setLastVisualChangeTime] = useState<number>(0)
	// Simple incrementing id for each overlayable
	const [nextIdCache, setNextIdCache] = useState<number>(0)

	useEffect(() => {
		let nextId = nextIdCache

		const initialOverlayables = Array.from(document.querySelectorAll('input, textarea')).filter(isOverlayable)
		initialOverlayables.forEach(overlayable => {
			nextId = registerOverlayable(overlayable as Overlayable, nextId, setNextIdCache)
		})
		setOverlayables(initialOverlayables)

		const mutationObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				// Catch the edge case where a sentir-registered element loses the sentir-* classes for whatever reason
				if (mutation.type === 'attributes') {
					const target = mutation.target
					if (mutation.attributeName === 'class' && isOverlayable(target)) {
						nextId = registerOverlayable(target as Overlayable, nextId, setNextIdCache)
					}
				}

				const addedOverlayables: Overlayable[] = Array.from(mutation.addedNodes).filter(isOverlayable)
				const removedOverlayables: Overlayable[] = Array.from(mutation.removedNodes).filter(isOverlayable)
				addedOverlayables.forEach(overlayable => {
					nextId = registerOverlayable(overlayable as Overlayable, nextId, setNextIdCache)
				})
				setOverlayables(prev => {
					const afterRemoved = prev.filter(overlayable => !removedOverlayables.includes(overlayable))
					return [...afterRemoved, ...addedOverlayables]
				})
			})
			setLastVisualChangeTime(Date.now())
		})
		mutationObserver.observe(document.body, { childList: true, subtree: true })

		return () => mutationObserver.disconnect()
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
