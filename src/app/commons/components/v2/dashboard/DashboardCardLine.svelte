<script lang="ts">
	export let prop: string;
</script>

<div class="line">
	<label for={prop}>
		<slot name="label"/>
	</label>
	<p id={prop}>
		<slot name="value"/>
	</p>
</div>

<style lang="scss">
  .line {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: flex-start;

    border-bottom: 1px solid var(--primary-900);

    background-color: var(--primary-900);

    user-select: text;

    & label {
      color: var(--mirai-200);
    }

    & p {

    }
  }
</style>
