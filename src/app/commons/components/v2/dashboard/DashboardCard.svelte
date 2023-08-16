<script lang="ts" context="module">
	export enum DashboardCardVariant {
		PRIMARY = 'primary',
		DANGER = 'danger',
	}

	export interface DashboardCardProps {
		variant: DashboardCardVariant
	}
</script>
<script lang="ts">
	export let variant: DashboardCardProps['variant'] = DashboardCardVariant.PRIMARY;
</script>

<div class="card" style:danger="variant === DashboardCardVariant.DANGER">
	{#if $$slots.header}
		<h1>
			<slot name="header"/>
		</h1>
	{/if}
	<div class="content">
		<slot>
			Empty
		</slot>
	</div>
</div>

<style lang="scss">
  .card {
    pointer-events: auto;

    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    font-size: 1rem;

    transition: all 2s;


    & h1 {
      padding: var(--spacing-1);

      font-size: 0.9em;
      font-weight: bold;
      color: var(--primary-300);
      text-align: left;
      text-transform: uppercase;

    }

    & .content {
      flex: 1;

      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: center;

      padding: var(--padding-xs);

      color: var(--mirai-100);
      background-color: var(--primary-800);
    }

    &.danger {
      background-color: var(--ramen-700);

      & h1 {
        color: var(--ramen-100);

        background-color: var(--ramen-600);
      }

      & .content {
        color: var(--mirai-50);
      }
    }
  }

</style>
