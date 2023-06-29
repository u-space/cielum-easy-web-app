<script lang="ts">
    import {OperationEntity} from "@utm-entities/operation";

    export let gufi: string;
    export let operations: OperationEntity[];

    $: operation = operations.find((operation) => operation.gufi === gufi);
    // Sort volumes according to ordinal
    $: volumes = (operation?.operation_volumes || []).sort((a, b) => Number(a.ordinal) - Number(b.ordinal));
</script>

{#if operation}
    <div id="wrapper">
        <section>
            <h1>{operation.name}</h1>
            <label for="name">Name</label>
            <input type="text" id="name" value={operation.name} disabled/>
            <label for="name">Name</label>
            <input type="text" id="name" value={operation.name} disabled/>
            <label for="name">Name</label>
            <input type="text" id="name" value={operation.name} disabled/>
            <label for="name">Name</label>
            <input type="text" id="name" value={operation.name} disabled/>
            {#each volumes as volume}
                {@const start = volume.effective_time_begin}
                {@const sDay = start.getDay()}
                {@const sMonth = start.getMonth()}
                {@const sYear = start.getFullYear()}
                {@const sHour = start.getHours()}
                {@const sMinute = start.getMinutes()}
                {@const sSecond = start.getSeconds()}
                {@const end = volume.effective_time_end}
                {@const eDay = end.getDay()}
                {@const eMonth = end.getMonth()}
                {@const eYear = end.getFullYear()}
                {@const eHour = end.getHours()}
                {@const eMinute = end.getMinutes()}
                {@const eSecond = end.getSeconds()}
                <article>
                    <h2>{Number(volume.ordinal) + 1}</h2>
                    <div>
                        <p> {volume.min_altitude} > {volume.max_altitude}</p>
                        <p> ({sDay} / {sMonth} / {sYear})</p>
                    </div>

                </article>
            {/each}
        </section>
    </div>
{/if}

<style lang="scss">
  #wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30svh;

    z-index: 9999;
    padding: 1rem;
    box-shadow: 0px 0 2px 2px var(--primary-900);

    overflow-y: auto;
    background-color: var(--primary-900);
  }

  section {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    color: var(--white-100);
    font-size: 2rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    margin-bottom: auto;
  }

  article {
    margin-top: 1rem;
    width: 100%;
    background-color: var(--primary-800);
    padding: 0.25rem;
    display: flex;
    justify-content: flex-start;
    border-radius: 4px;

    & > h2 {
      color: var(--mirai-200);
      font-size: 1.25rem;
      margin: 0;
    }

    & > div {
      background-color: var(--primary-700);
      color: white;
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
