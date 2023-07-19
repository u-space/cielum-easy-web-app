<script lang="ts">
    import type {CTooltipProps} from './CTooltip';
    import {CTooltipPosition} from './CTooltip';
    import {fade} from 'svelte/transition';

    export let open: CTooltipProps['open'] = false;
    export let position: CTooltipProps['position'] = CTooltipPosition.Bottom;
    export let text: CTooltipProps['text'] = '';
</script>

{#if open}
    <div id="tooltip" transition:fade={{duration: 100}} class:left={position === CTooltipPosition.Left}
         class:top={position === CTooltipPosition.Top}
         class:right={position === CTooltipPosition.Right}
         class:bottom={position === CTooltipPosition.Bottom}
    >
        {text}
    </div>
{/if}

<style lang="scss">
  $tooltip-gap: 0.25rem;

  #tooltip {
    position: fixed;
    height: 100%;
    width: fit-content;
    white-space: nowrap;

    display: flex;
    justify-content: center;
    align-items: center;


    padding: var(--spacing-2);

    color: var(--mirai-50);
    font-size: 0.75rem;
    font-family: 'Lexend Deca', sans-serif;

    border-radius: var(--radius-l);

    background-color: var(--primary-900);
  }

  .left {
    top: 0;
    right: calc(100% + $tooltip-gap);
  }

  .right {
    top: 0;
    left: calc(100% + $tooltip-gap);
  }

  .top {
    bottom: calc(100% + $tooltip-gap);
    left: 0;
  }

  .bottom {
    top: calc(100% + $tooltip-gap);
    transform: translateX(-50%);
  }
</style>
