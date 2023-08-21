<script lang="ts">
	import CButton from '@tokyo/gui/CButton.svelte';
	import {CSize} from '@tokyo/gui/CSizeWrapper';

	export let canMenuOpen = false; // Setting this to true will automatically open, but allow for closing (and reopening)

	let isMenuOpen = false;
	const open = () => isMenuOpen = true;
	const close = () => isMenuOpen = false;

	$: {
		if (canMenuOpen) {
			open(); // Using a function to prevent reactivity on "isMenuOpen"
		} else {
			close();
		}
	}
</script>

<div class="container" style:--dashboard-aside-size={isMenuOpen ? '261px': 0}>
	<aside>
		<div class="menu">
			<slot name="menu"/>
		</div>
	</aside>
	<main>
		<slot/>
		{#if canMenuOpen}
			<div class="actions">
				<CButton size={CSize.LARGE} icon={isMenuOpen ? "caret-double-left-bold" : "caret-double-right-bold"}
						 on:click={() => isMenuOpen = !isMenuOpen}/>
			</div>
		{/if}
	</main>
</div>

<style lang="scss">
  .container {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    display: flex;
    justify-content: flex-start;


    & main {
      flex: 1;

      min-height: 0;
      min-width: 0;

      position: relative;

      & .actions {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;

        display: flex;
        flex-direction: column;
        justify-content: center;

        pointer-events: none;

        & :global(> *) {
          pointer-events: auto;
        }
      }
    }

    & aside {
      flex-shrink: 0;
      width: var(--dashboard-aside-size);
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;

      background-color: var(--primary-900);

      transition: width var(--layout-transition-duration) var(--layout-transition-easing);

      & .menu {
        min-height: 100%;
        width: var(--dashboard-aside-size);

        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--dashboard-aside-size), 1fr));
        grid-template-rows: repeat(auto-fit, 6rem);

        & :global(> *) {
          min-width: var(--dashboard-aside-size);
          width: 100%;
          height: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          //white-space: nowrap;
          padding: 0.5rem;
          box-sizing: border-box;
        }

        & :global(> h1) {
          font-weight: 800;
          color: var(--primary-100);
          font-size: 1.5rem;

          // align h1 text vertically
          display: flex;
          
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  @media screen and (max-width: 740px) {
    .container {
      flex-direction: column-reverse;

      & main {
        & .actions {
          // Move button to the bottom middle

          left: 0;
          right: 0;
          bottom: 0.5rem;
          top: auto;

          flex-direction: row;

          & :global(> *) {
            transform: rotate(-90deg);
          }
        }
      }

      & aside {
        height: var(--dashboard-aside-size);
        width: 100%;

        & .menu {
          width: 100%;
        }
      }
    }
  }
</style>
