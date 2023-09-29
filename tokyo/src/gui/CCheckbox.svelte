<script lang="ts">
    import type {CCheckboxCheckedEvent, CCheckboxProps} from "@tokyo/gui/CCheckbox";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher<{ check: CCheckboxCheckedEvent }>();

    export let label: CCheckboxProps['label'];
    export let id: CCheckboxProps['id'];
    export let fill: CCheckboxProps['fill'] = false;
    export let checked: CCheckboxProps['checked'] = false;

    function handleChange(event: Event) {
        checked = (event.target as HTMLInputElement).checked;
        dispatch('check', {
            id,
            checked
        });
    }
</script>

<div class="checkbox-container" class:fill={fill}>
    <input id={id} type="checkbox" checked={checked} on:change={handleChange}/>
    <label for={id}>{label}</label>
</div>

<style lang="scss">
  @import "./mixins.scss";

  .checkbox-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5em;
    height: 1em;
    font-size: 1em;
    user-select: none;

    &.fill {
      min-width: 100%;
      flex: 1;
    }
  }

  label {
    color: var(--white-100) !important;
    text-transform: uppercase;
  }

  input {
    line-height: normal;
    margin: 0;
    min-height: 1rem;
    min-width: 1rem;
    padding: 0;
    flex: 0;

    accent-color: var(--primary-400);

    border: 1px solid red;
  }
</style>
