import { useCallback, useEffect, useState } from 'react'
import { Overlayable, OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared/lib/types'
import { isOverlayable, isRegistered } from '@extension/shared/lib/utils'
import SingleOverlay from '@/components/SingleOverlay'
import _ from 'lodash'
import { getCompletions } from './logic/prompt'

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
		completions: [],
		completionsTimestamp: 0,
	}
}

export default function App() {
	const [registeredOverlayables, setRegisteredOverlayables] = useState<RegisteredOverlayable[]>([])
	/** The SingleOverlay components will re-render when this changes */
	const [lastVisualChangeTime, setLastVisualChangeTime] = useState<number>(0)

	const findCompletions = useCallback(
		_.throttle(async (registeredOverlayable: RegisteredOverlayable) => {
			const { completions, timestamp: completionsTimestamp } = await getCompletions({
				inputText: registeredOverlayable.text,
				url: window.location.origin + window.location.pathname,
				surroundingText: [],
				placeholder: registeredOverlayable.overlayable.placeholder,
				label: registeredOverlayable.overlayable.labels?.[0]?.textContent,
			})
			setRegisteredOverlayables(prev =>
				prev.map(o => {
					if (o.id !== registeredOverlayable.id) return o
					// Only update the completions if the timestamp is newer
					if (completionsTimestamp > o.completionsTimestamp) {
						return { ...o, completions, completionsTimestamp }
					}
					return o
				}),
			)
		}, 100),
		[],
	)

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

	const onOverlayableChange = useCallback(
		(registeredOverlayable: RegisteredOverlayable, change: Partial<OverlayableChangeEvent>) => {
			const changedOverlayable = { ...registeredOverlayable, ...change }
			// If the text has changed, or the overlayable is focused and has no completions
			if (change.text !== undefined || (change.focused && registeredOverlayable.completions.length === 0)) {
				void findCompletions(changedOverlayable)
			}
			setRegisteredOverlayables(prev => prev.map(o => (o.id === registeredOverlayable.id ? changedOverlayable : o)))
		},
		[findCompletions],
	)

	return (
		<>
			{registeredOverlayables.map(registeredOverlayable => (
				<SingleOverlay
					key={registeredOverlayable.id}
					registeredOverlayable={registeredOverlayable}
					lastVisualChangeTime={lastVisualChangeTime}
					onResize={onOverlayableResize}
					onChange={change => onOverlayableChange(registeredOverlayable, change)}
				/>
			))}
		</>
	)
}
