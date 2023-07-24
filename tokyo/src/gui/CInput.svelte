<script lang="ts">
    import CSizeWrapper from "@tokyo/gui/CSizeWrapper.svelte";
    import {CSize} from "@tokyo/gui/CSizeWrapper";
    import CButton from "@tokyo/gui/CButton.svelte";

    export let property: string;
    export let label: string;
    export let value: string;
    export let size: CSize = CSize.MEDIUM;
</script>
{#if label}
    <label for={property}>{label.toUpperCase()}</label>
{/if}

<CSizeWrapper {size}>
    <div class="input-wrapper">
        <input type="text" id={property} name={property} bind:value height="25"/>
        {#if value.length > 0}
            <div class="x">
                <CButton size={CSize.EXTRA_SMALL} icon="x-bold" on:click={() => value = ''}/>
            </div>
        {/if}
    </div>
</CSizeWrapper>

<style lang="scss">
  @import './mixins.scss';

  .input-wrapper {
    height: 1.7em;
    background-color: white;
  }

  .x {
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(125%);
  }

  input {
    @include no-outline;
    background-color: var(--white-100);

    color: var(--mirai-900);

    font-size: 0.6em;
    width: 100%;
    height: 100%;
    margin: 0;

    font-family: 'Lexend Deca', sans-serif;

    box-shadow: inset 0 0 1px 0 var(--primary-900);
    outline: 1px solid var(--mirai-600);
    border-radius: var(--radius-m);
    @include box-shadow-1;

    &:focus {
      @include no-outline;

      outline: 1px solid var(--primary-400);
      outline-offset: 0;

    }

    transition: all 0.2s ease-in-out;
  }

  label {
    font-size: 0.75rem;
    color: var(--primary-600);
  }

</style>
