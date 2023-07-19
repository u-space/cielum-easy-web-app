<script lang="ts">
	export let property: string;
	export let label: string;
	export let value: string;
</script>
{#if label}
	<label for={property}>{label.toUpperCase()}</label>
{/if}
<input type="text" id={property} name={property} bind:value/>


<style lang="scss">
  @import './mixins.scss';

  input {
    @include no-outline;
    background-color: var(--white-100);

    width: 100%;

    padding: 0.25rem;
    font-size: 0.75rem;

    font-family: 'Lexend Deca', sans-serif;

    box-shadow: inset 0 0 1px 0 var(--primary-900);
    outline: 1px solid var(--mirai-400);
    border-radius: var(--radius-m);

    &:focus {
      @include no-outline;

      outline: 1px solid var(--primary-400);
      outline-offset: 0;

    }
  }

  label {
    font-size: 0.75rem;
    color: var(--primary-600);
  }

</style>
