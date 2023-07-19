<script lang="ts">
	import CInput from '@tokyo/gui/CInput.svelte';
	import {getAutocomplete, getSearch} from '@tokyo/gui/CGeocoder';
	import {createQuery} from '@tanstack/svelte-query';
	import CButton from '@tokyo/gui/CButton.svelte';
	import {CButtonSize} from '@tokyo/gui/CButton';
	import {tokyoFlyToPosition} from '@tokyo/store';
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	export let geaopifyApiKey;

	let searchText = '';
	let currentSearchText = '';

	const queryAutocomplete = createQuery({
		queryKey: ['geocoder-autocomplete'],
		queryFn: () => getAutocomplete(geaopifyApiKey)(searchText),
		enabled: false,
		retry: false,
	});

	let autocompleteTimeout = null;

	const querySearch = createQuery({
		queryKey: ['geocoder-search'],
		queryFn: () => getSearch(geaopifyApiKey)(searchText),
		enabled: false,
		retry: false,
	});

	$: {
		if (searchText.length >= 3 && currentSearchText !== searchText) {
			if (autocompleteTimeout) {
				clearTimeout(autocompleteTimeout);
			}
			autocompleteTimeout = setTimeout(() => {
				$queryAutocomplete.refetch();
			}, 500);
			currentSearchText = searchText;
		}
	}
</script>

<CInput bind:value={searchText}/>
<div id="results">
	{#if searchText.length < 3}
		<div class="status">Enter at least 3 characters</div>
	{:else}
		{#if $queryAutocomplete.isLoading && $queryAutocomplete.isFetching}
			<div class="status">Loading...</div>
		{:else if $queryAutocomplete.isError}
			<div class="status">Error: {$queryAutocomplete.error.message}</div>
		{:else if $queryAutocomplete.isSuccess}
			{#each $queryAutocomplete.data.data as place}
				<div class="place">
					<CButton icon="map-pin-fill" size={CButtonSize.EXTRA_SMALL}
							 on:click={() => {
							 $tokyoFlyToPosition = {...$tokyoFlyToPosition, latitude: place.lat, longitude: place.lon}
							 dispatch('select', place);
							 }}/>
					<p>{place.formatted}</p>
				</div>
			{/each}

		{/if}
	{/if}
</div>

<style lang="scss">
  #results {
    margin-top: 0.25rem;

    & .status {
      text-align: center;
    }

    & .place {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 1em;
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--mirai-200);

      & p {
        margin: 0;
      }
    }
  }
</style>
