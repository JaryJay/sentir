<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, waitFor, within } from '@storybook/test';
  import SentirPlayground from './SentirPlayground.svelte';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Sentir/Playground',
    component: SentirPlayground,
    parameters: {
      // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
      layout: 'fullscreen',
    },
  });
</script>

<Story name="Logged In" play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // const loginButton = canvas.getByRole('button', { name: /Log in/i });
  }}
/>

<Story name="Logged Out" />
