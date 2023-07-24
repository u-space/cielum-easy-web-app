<script lang="ts">


    import {CSize} from "./CSizeWrapper";

    export let size: CSize = CSize.MEDIUM;
</script>

<div class:extra_small={size === CSize.EXTRA_SMALL}
     class:small={size === CSize.SMALL} class:medium={size === CSize.MEDIUM}
     class:large={size === CSize.LARGE} class:extra_large={size === CSize.EXTRA_LARGE}>
    <slot/>
</div>

<style>

    .extra_small {
        font-size: 0.75rem;
        height: 1rem;
    }

    .small {
        font-size: 0.85rem;
    }

    .medium {
        font-size: 1rem;
    }

    .large {
        font-size: 1.15rem;
    }

    .extra_large {
        font-size: 1.35rem;
        

    }
</style>
