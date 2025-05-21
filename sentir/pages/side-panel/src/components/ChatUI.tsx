import { useState } from 'react'

const ChatUI: React.FC = () => {
	const [chat, setChat] = useState('')

	return (
		<>
			<header className="flex items-center justify-between px-2 py-1">
				<button>New chat</button>
				<div className="flex items-center gap-2 text-red-400">Other stuff</div>
			</header>
			<main className="flex-1 px-2 py-1 flex flex-col items-stretch">
				<textarea
					className="w-full"
					value={chat}
					onChange={e => setChat(e.target.value)}
					placeholder="How can I help you?"
				/>
			</main>
			<footer className="flex flex-col gap-2 px-2 py-1">
				<h3>Past chats</h3>
				<div className="flex flex-col gap-2">
					<button className="flex items-center justify-between">
						<span>Example chat</span>
						<span>2d ago</span>
					</button>
					<button className="flex items-center justify-between">
						<span>Example chat 2</span>
						<span>4d ago</span>
					</button>
				</div>
			</footer>
		</>
	)
}
ChatUI.displayName = 'ChatUI'

export default ChatUI
