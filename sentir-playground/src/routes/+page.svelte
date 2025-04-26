<script lang="ts">
	let text = $state("");
	let text2 = $state("");
</script>

<div class="flex flex-col gap-4 w-96">
	<input type="text" bind:value={text} placeholder="Product Search" />
	<textarea bind:value={text2} placeholder="Why are you applying for this job?"></textarea>
</div>