<script lang="ts">
	let text = $state("");
	let text2 = $state("");
	let text3 = $state("");
	let text4 = $state("");
	let showInput2 = $state(true);
	let showInput3 = $state(false);
</script>

<div class="flex flex-col gap-4 w-96">
	<div class="flex ml-1 mt-2 mb-3 mr-4 p-2 border border-gray-300">
		<input id="input-1" type="text" bind:value={text} class="ml-1 mt-2 mb-3 mr-4 px-2 py-1 rounded-md border border-gray-300" placeholder="Product Search" />
	</div>
	<textarea id="textarea-1" bind:value={text2} placeholder="Why are you applying for this job?"></textarea>
	<button onclick={() => showInput2 = !showInput2} class="border p-2 rounded-md">Toggle Input 2</button>
	{#if showInput2}
		<input id="input-2" bind:value={text3} placeholder="What's the powerhouse of the cell?" />
	{/if}

	<button onclick={() => showInput3 = !showInput3} class="border p-2 rounded-md">Toggle Input 3</button>
	{#if showInput3}
		<input id="input-3" bind:value={text4} placeholder="What's the meaning of life?" />
	{/if}
</div>