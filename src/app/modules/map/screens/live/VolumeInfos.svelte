<script lang="ts">
    import {OperationVolume} from "@utm-entities/operation";
    import {createEventDispatcher} from "svelte";

    export let volume: OperationVolume;
    export let volumesLength: number;
    export let index: number;

    const dispatch = createEventDispatcher<{
        next: never,
        previous: never
    }>();

    $: start = volume.effective_time_begin;
    $: end = volume.effective_time_end;
    $: day = (start || new Date()).getDate();
    $: month = (start || new Date()).getMonth() + 1;
    $: year = (start || new Date()).getFullYear();
    $: startHour = (start || new Date()).getHours();
    $: startMinutes = (start || new Date()).getMinutes();
    $: startSeconds = (start || new Date()).getSeconds();
    $: endHour = (end || new Date()).getHours();
    $: endMinutes = (end || new Date()).getMinutes();
    $: endSeconds = (end || new Date()).getSeconds();

    function hm(hour: number) {
        return hour < 10 ? `0${hour}` : hour;
    }
</script>

<article>
    <button on:click={() => dispatch('previous')} disabled={index === 0}>{'<'}</button>
    <h2>Volúmen {index + 1} de {volumesLength}</h2>
    <div>
        <p> Alturas: {volume.min_altitude}m / {volume.max_altitude}m</p>
        <p> [{day}/{month}/{year}] </p>
        <p> {hm(startHour)}:{hm(startMinutes)}:{hm(startSeconds)} > {hm(endHour)}:{hm(endMinutes)}:{hm(endSeconds)} </p>
    </div>
    <button on:click={() => dispatch('next')} disabled={index === volumesLength-1}>{'>'}</button>
</article>

<style lang="scss">
  article {
    margin-top: 1rem;
    width: 100%;
    background-color: var(--primary-800);
    padding: 0.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;

    & > h2 {
      color: var(--mirai-200);
      font-size: 1.25rem;
      margin: 0;
      max-width: 75px;
      text-align: center;
    }

    & > div {
      color: white;
      text-align: center;
    }

    & button {
      background-color: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.25s ease-in-out;
      height: 100%;
      background-color: var(--primary-600);

      &:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }

      &:hover {
        background-color: var(--primary-700);
      }
    }
  }
</style>
