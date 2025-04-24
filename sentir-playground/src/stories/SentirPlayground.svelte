<script lang="ts">
  import './page.css';
  import Header from './Header.svelte';

  let user = $state<{ name: string }>();
</script>

<main class="flex flex-col gap-4 items-start p-4">
  Hello!
  <input type="text" />
  <button>Click me</button>
  <textarea></textarea>
  <input type="checkbox" />
  <input type="button" value="Click me" />
  <input type="submit" value="Click me" />
  <select>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
  </select>
</main>