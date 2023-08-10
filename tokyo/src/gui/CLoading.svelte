<script lang="ts">
	import {onMount} from 'svelte';
	import {fade} from 'svelte/transition';

	let steps = 0;

	onMount(() => {
		const interval = setInterval(() => steps = steps + 1, 500);
		return () => clearInterval(interval);
	});

	$: dots = '.'.repeat(steps % 4);
	$: greyedOut = '.'.repeat(3 - steps % 4);
</script>

<div class="loading" transition:fade={{duration: 200}}>
	<span>{dots}</span>
	<span class="greyed">{greyedOut}</span>
</div>
<style lang="scss">
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-index-unnecessary-banner);

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(var(--primary-900-rgb), 0.8);

    backdrop-filter: blur(32px);

    font-size: 50vh;

    & span {
      transform: translateY(-25%);
      color: var(--white-100);
      user-select: none;

      &.greyed {
        color: var(--primary-800);
      }
    }
  }
</style>
