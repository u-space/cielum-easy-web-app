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
	<h1>
		<slot name="header"/>
	</h1>
	<div class="content">
		<slot/>
	</div>
</div>

<style lang="scss">
  .card {
    border-radius: var(--radius-m);

    box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
    pointer-events: auto;

    transition: all 2s;

    & h1 {
      padding: var(--spacing-1);

      color: var(--primary-100);
      text-align: center;
      text-transform: uppercase;

      background-color: var(--primary-700);
    }

    & .content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: flex-start;

      padding: var(--padding-xs);

      color: var(--mirai-100);

      background-color: var(--primary-900);
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
