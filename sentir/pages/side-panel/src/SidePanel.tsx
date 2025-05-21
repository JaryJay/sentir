import { withErrorBoundary } from '@extension/shared'
import ChatUI from './components/ChatUI'

const SidePanel = () => {
	// const theme = useStorage(exampleThemeStorage)

	return (
		<>
			<ChatUI />
		</>
	)
}

export default withErrorBoundary(SidePanel, <div>An error occurred</div>)
