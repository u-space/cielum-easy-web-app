<script lang="ts">
	import {CModalProps, CModalVariant, CModalWidth} from '@tokyo/gui/CModal';
	import {createEventDispatcher, onMount} from 'svelte';
	import CButton from '@tokyo/gui/CButton.svelte';

	const dispatch = createEventDispatcher();

	export let title: CModalProps['title'];
	export let width: CModalProps['width'] = CModalWidth.SMALLEST;
	export let variant: CModalProps['variant'] = CModalVariant.INFORMATION;
	export let closeText: CModalProps['closeText'] = 'Close';

	export let disabled: CModalProps['disabled'] = false;

	let ref;

	onMount(() => {
		ref.showModal();
	})
</script>

<dialog bind:this={ref} class:largest={width === CModalWidth.LARGEST} class:smallest={width === CModalWidth.SMALLEST}
		on:cancel={(event) => {
			if (disabled) event.preventDefault();
			dispatch('cancel', event)
		}}
		on:close={(event) => {
			if (disabled) event.preventDefault();
			dispatch('close', event)
		}}>
	{#if title}
		<h1 class:information={variant === CModalVariant.INFORMATION}
			class:error={variant === CModalVariant.ERROR}
			class:success={variant === CModalVariant.SUCCESS}
		>{title}</h1>
	{/if}
	<div class="body">
		{#if $$slots.default}
			<slot/>
		{/if}
		<div class="actions">
			{#if !disabled}
				<CButton
						on:click={(evt) => {
						evt.preventDefault();
						ref.close()
					}}
				>{closeText}</CButton>
			{/if}
		</div>
	</div>
</dialog>

<style lang="scss">
  @import './mixins.scss';

  $min-width: 500px;
  $max-width: 800px;

  dialog[open] {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    min-width: min($min-width, 100%);
    min-height: 10vh;
    margin: auto auto;

    color: var(--mirai-900);

    border-radius: var(--radius-l);

    background-color: transparent;
    // There's a small rendering bug that makes the dialog background visible (1px) near the border-radius

    padding: 0;

    overflow: hidden;
    @include box-shadow-1;
    @include no-outline;

    // Size variants
    &.smallest {
      width: min($min-width, 100%);
    }

    &.largest {
      width: $max-width;
    }


    & > h1 {
      width: 100%;
      padding: 0.5rem;

      margin: 0;
      font-size: 1rem;

      text-align: center;
      text-transform: uppercase;


      &.error {
        color: var(--ramen-100);

        background-color: var(--ramen-600);
      }

      &.success {
        color: var(--yamate-100);

        background-color: var(--yamate-600);
      }

      &.information {
        color: var(--primary-100);

        background-color: var(--primary-600);
      }
    }

    & > .body {
      flex: 1;
      width: 100%;
      padding: var(--padding-xs);

      background-color: var(--mirai-100);

      & .actions {
        display: flex;
        gap: 0.5px;
        justify-content: flex-start;
        flex-direction: row-reverse;

        width: 100%;
        margin-top: 1em;


      }
    }


    &::backdrop {
      background-color: rgb(var(--primary-900-rgb), 0.75);
    }
  }

</style>
