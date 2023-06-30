<script lang="ts">
    import {OperationEntity} from "@utm-entities/operation";
    import VolumeInfos from "./VolumeInfos.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let operation: OperationEntity;
    export let indexSelectedVolume: number;


    // Sort volumes according to ordinal
    $: volumes = (operation?.operation_volumes || [])

</script>

{#if operation}
    <div id="wrapper">
        <button on:click={() => dispatch('close')}>X</button>
        <section>
            <h1>{operation.name}</h1>
            <label for="name">Contacto</label>
            <input type="text" id="name" value={`${operation.contact} (Tel: ${operation.contact_phone})`} disabled/>
            <label for="flight_comments">Comentarios del vuelo</label>
            <input type="text" id="flight_comments" value={operation.flight_comments} disabled/>
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
    height: 35svh;

    z-index: 9999;
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
    width: 2rem;
    font-size: 1.25rem;
    top: 0;
    right: 1rem;
    transform: translateY(-50%);
    border-radius: 100vh;
    font-weight: bold;
    border: 1px solid var(--ramen-900);
    box-shadow: 0px 0 1px 1px var(--ramen-700);
    outline: none;
    background-color: var(--ramen-500);
    color: var(--ramen-200);

    &:active {
      background-color: var(--ramen-600);
      color: var(--ramen-100);
      transform: translateY(-50%) scale(0.95);
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
