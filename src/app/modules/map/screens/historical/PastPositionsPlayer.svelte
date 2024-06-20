<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import CButton from '@tokyo/gui/CButton.svelte';
	import {
		getPositionAPIClient,
		getPositionRidAPIClient,
		PositionEntity
	} from '@utm-entities/position';
	import { createEventDispatcher } from 'svelte';
	import env from '../../../../../vendor/environment/env';

	const dispatch = createEventDispatcher<{ positions: Map<string, PositionEntity[]> }>();

	export let token: string;
	export let gufi: string;
	export let from: Date;
	export let to: Date;

	let currentTime = 0;

	const positionAPIClient = getPositionAPIClient(env.core_api, token); // TODO: move to root of new app
	const queryPosition = createQuery({
		queryKey: ['positions'],
		queryFn: () => positionAPIClient.getPastPositions(gufi, from, to)
	});

	$: {
		if (
			$queryPosition.isSuccess &&
			$queryPosition.data?.data &&
			$queryPosition.data?.data.length > 0 &&
			currentTime
		) {
			let fetchedVehiclePositions = new Map();
			for (const position of $queryPosition.data.data) {
				if (position.time_sent > currentTime) {
					continue;
				}
				const id = position.gufi + position.uvin;
				fetchedVehiclePositions.set(
					id,
					fetchedVehiclePositions.has(id)
						? [...fetchedVehiclePositions.get(id)!, position]
						: [position]
				);
			}
			dispatch('positions', fetchedVehiclePositions);
		}
	}

	$: firstPositionTime = $queryPosition.data?.data[0]?.time_sent.getTime();
	$: lastPositionTime =
		$queryPosition.data?.data[$queryPosition.data?.data.length - 1]?.time_sent.getTime();

	let timer: ReturnType<typeof setInterval>;
	let factor = 1;

	function play() {
		if (timer) clearInterval(timer);
		if (currentTime === 0) currentTime = firstPositionTime || 0;
		timer = setInterval(() => {
			currentTime += factor * 1000;
			if (currentTime > lastPositionTime) {
				currentTime = lastPositionTime;
				clearInterval(timer);
			}
		}, 1000);
	}

	function pause() {
		if (timer) clearInterval(timer);
	}
</script>

{#if currentTime > 0}
	<h1 id="time">
		{new Date(currentTime).toLocaleString([], {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})}
	</h1>
{/if}
{#if $queryPosition.isSuccess && $queryPosition.data.data && $queryPosition.data.data.length > 0}
	<div class="actions">
		<CButton icon="play-duotone" on:click={play} />
		<CButton icon="pause" on:click={pause} />
		<input
			type="range"
			class="seek"
			min={$queryPosition.data.data[0].time_sent.getTime()}
			max={$queryPosition.data.data[$queryPosition.data.data.length - 1].time_sent.getTime()}
			step="1000"
			bind:value={currentTime}
		/>
		<CButton icon="fast-forward-duotone" disabled={factor === 1} on:click={() => (factor = 1)}>
			x1
		</CButton>
		<CButton
			icon="fast-forward-duotone"
			disabled={factor === 10}
			on:click={() => (factor = 10)}
		>
			x10
		</CButton>
		<CButton
			icon="fast-forward-duotone"
			disabled={factor === 100}
			on:click={() => (factor = 100)}
		>
			x100
		</CButton>
	</div>
{/if}

<style lang="scss">
	.seek {
		bottom: 1rem;
		width: 100%;
	}

	h1 {
		position: absolute;
		bottom: 100%;
		background-color: var(--primary-900);
		font-size: 1.5rem;
		left: 50%;
		transform: translateX(-50%);

		padding: 0.5rem;
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.actions {
		display: flex;
		gap: 0.25rem;
	}
</style>
