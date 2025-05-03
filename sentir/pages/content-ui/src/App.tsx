import { useCallback, useEffect, useState } from 'react'
import { Overlayable, OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared/lib/types'
import { computeKey, isOverlayable, isRegistered } from '@extension/shared/lib/utils'
import SingleOverlay from '@/components/SingleOverlay'

function registerOverlayable(overlayable: Overlayable, id: number): RegisteredOverlayable {
	if (isRegistered(overlayable)) {
		console.error('Overlayable is already registered', overlayable)
		throw new Error('Overlayable is already registered')
	}
	overlayable.classList.add(`sentir-o-${id}`, 'sentir-registered')
	return {
		overlayable,
		id,
		focused: false,
		text: overlayable.value,
	}
}

export default function App() {
	const [registeredOverlayables, setRegisteredOverlayables] = useState<RegisteredOverlayable[]>([])
	/** The SingleOverlay components will re-render when this changes */
	const [lastVisualChangeTime, setLastVisualChangeTime] = useState<number>(0)

	/**
	 * Mutation observer to detect new/modified overlayable elements and register them
	 */
	useEffect(() => {
		let nextId = 1

		const initialOverlayables = Array.from(document.querySelectorAll('input, textarea')).filter(isOverlayable)
		setRegisteredOverlayables(
			initialOverlayables
				.filter(o => !isRegistered(o))
				.map(overlayable => registerOverlayable(overlayable as Overlayable, nextId++)),
		)

		const mutationObserver = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				// Catch the edge case where a sentir-registered element loses the sentir-* classes for whatever reason
				if (mutation.type === 'attributes') {
					const target = mutation.target
					if (['class', 'type'].includes(mutation.attributeName ?? '') && isOverlayable(target)) {
						const registered = registerOverlayable(target as Overlayable, nextId++)
						setRegisteredOverlayables(prev => [...prev, registered])
					}
					return
				}

				const addedOverlayables = Array.from(mutation.addedNodes).filter(isOverlayable)
				const removedOverlayables = Array.from(mutation.removedNodes).filter(isOverlayable)
				const registeredAddedOverlayables = addedOverlayables.map(overlayable =>
					registerOverlayable(overlayable as Overlayable, nextId++),
				)
				setRegisteredOverlayables(prev => {
					const afterRemoved = prev.filter(({ overlayable }) => !removedOverlayables.includes(overlayable))
					return [...afterRemoved, ...registeredAddedOverlayables]
				})
			})
			setLastVisualChangeTime(Date.now())
		})
		mutationObserver.observe(document.body, { childList: true, subtree: true })

		return () => mutationObserver.disconnect()
	}, [])

	/**
	 * Update lastVisualChangeTime whenever user scrolls
	 */
	useEffect(() => {
		const handleScroll = () => {
			setLastVisualChangeTime(Date.now())
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const onOverlayableResize = useCallback(() => {
		setLastVisualChangeTime(Date.now())
	}, [])

	const onOverlayableChange = useCallback((id: number, change: Partial<OverlayableChangeEvent>) => {
		setRegisteredOverlayables(prev => prev.map(o => (o.id === id ? { ...o, ...change } : o)))
	}, [])

	return (
		<>
			{registeredOverlayables.map(registeredOverlayable => (
				<SingleOverlay
					key={registeredOverlayable.id}
					registeredOverlayable={registeredOverlayable}
					lastVisualChangeTime={lastVisualChangeTime}
					onResize={onOverlayableResize}
					onChange={change => onOverlayableChange(registeredOverlayable.id, change)}
				/>
			))}
		</>
	)
}
