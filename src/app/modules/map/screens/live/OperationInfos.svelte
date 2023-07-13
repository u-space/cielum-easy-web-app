<script lang="ts">
    import {OperationEntity} from "@utm-entities/operation";
    import VolumeInfos from "./VolumeInfos.svelte";
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher();


    export let operation: OperationEntity;
    export let indexSelectedVolume: number;

    const caretUp = '<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 256 256"><path fill="white" d="M216.49 199.51a12 12 0 0 1-17 17L128 145l-71.51 71.49a12 12 0 0 1-17-17l80-80a12 12 0 0 1 17 0Zm-160-63L128 65l71.51 71.52a12 12 0 0 0 17-17l-80-80a12 12 0 0 0-17 0l-80 80a12 12 0 0 0 17 17Z"/></svg>'
    const caretDown = '<svg xmlns="http://www.w3.org/2000/svg"  height="100%" viewBox="0 0 256 256"><path fill="white" d="M216.49 119.51a12 12 0 0 1 0 17l-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 1 1 17-17L128 191l71.51-71.52a12 12 0 0 1 16.98.03Zm-97 17a12 12 0 0 0 17 0l80-80a12 12 0 0 0-17-17L128 111L56.49 39.51a12 12 0 0 0-17 17Z"/></svg>'

    function handleButtonClick() {
        isVisible = !isVisible;
        if (isVisible) {
            dispatch('expand');
        } else {
            dispatch('collapse');
        }
    }

    let isVisible = false;

    // Sort volumes according to ordinal
    $: volumes = (operation?.operation_volumes || [])
</script>

<button class:bottom={!isVisible} class:top={isVisible}
        on:click={handleButtonClick}>{@html isVisible ? caretDown : caretUp}</button>
{#if operation && isVisible}
    <div id="wrapper">
        <section>
            <h1>{operation.name}</h1>
            <label for="name">Contacto</label>
            <input type="text" id="name" value={`${operation.contact} (Tel: ${operation.contact_phone})`} disabled/>

            <label for="state">Estado</label>
            <input type="text" id="state" value={operation.state} disabled/>

            <VolumeInfos on:previous on:next volume={volumes[indexSelectedVolume]} index={indexSelectedVolume}
                         volumesLength={volumes.length}/>
        </section>
    </div>
{/if}

<style lang="scss">
  #wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 16rem;


    box-shadow: 0px 0 2px 2px var(--primary-900);

    background-color: var(--primary-900);
  }

  section {
    position: relative;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    flex-direction: column;

    padding: 1rem;
    overflow-y: auto;
  }

  h1 {
    color: var(--white-100);
    font-size: 2rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    margin-bottom: auto;
  }

  button {
    position: absolute;
    height: 2rem;
    width: 4rem;
    font-size: 1.25rem;

    left: 50vw;
    z-index: 1;
    transform: translate(-50%, 50%);
    border-radius: 0.25rem;
    font-weight: bold;
    border: 1px solid var(--ramen-900);
    box-shadow: 0px 0 1px 1px var(--ramen-700);
    outline: none;
    background-color: var(--ramen-500);
    color: var(--ramen-200);

    display: flex;
    justify-content: center;
    align-items: center;

    &:active {
      background-color: var(--ramen-600);
      color: var(--ramen-100);
      transform: translate(-50%, 50%) scale(0.9);
    }

    &.top {
      bottom: 16rem;
      transform: translate(-50%, 50%);

      &:active {
        transform: translate(-50%, 50%) scale(0.9);
      }
    }

    &.bottom {
      bottom: 1rem;
      transform: translateX(-50%);

      &:active {
        transform: translateX(-50%) scale(0.9);
      }
    }
  }


  label {
    color: var(--primary-200);
  }

  input {
    width: 100%;
    border: none;

    color: var(--white-100);
    background-color: var(--primary-900);
    font-family: 'Lexend Deca', sans-serif;
  }

</style>
