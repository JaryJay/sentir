<script lang="ts">
	let text = $state("");
	let text2 = $state("");
	let text3 = $state("");
	let text4 = $state("");
	let showInput2 = $state(true);
	let showInput3 = $state(true);
</script>

<svelte:head>
	<title>Sentir Playground</title>
</svelte:head>
<div class="flex flex-col gap-4 w-96">
	<div class="flex ml-1 mt-2 mb-3 mr-4 p-2 border border-gray-300">
		<input id="input-1" type="text" bind:value={text} class="w-full ml-1 mt-2 mb-3 mr-4 pl-2 pt-1 pb-3 rounded-md border border-gray-300" placeholder="Product Search" />
	</div>
	<textarea id="textarea-1" bind:value={text2} placeholder="Why are you applying for this job?"></textarea>
	<button onclick={() => showInput2 = !showInput2} class="border p-2 rounded-md">Toggle Input 2</button>
	{#if showInput2}
		<input id="input-2" bind:value={text3} class="align-top h-[36px] pt-4 pb-2 text-lg" placeholder="What's the powerhouse of the cell?" />
	{/if}

	<button onclick={() => showInput3 = !showInput3} class="border p-2 rounded-md">Toggle Input 3</button>
	{#if showInput3}
		<input id="input-3" bind:value={text4} style:padding-inline="10px" placeholder="What's the meaning of life?" />
	{/if}
	<div class="flex flex-col justify-between h-[1200px] border border-gray-300 rounded-md">
		Very tall div so that we can test scroll
	</div>
</div>
