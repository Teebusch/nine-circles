<script type="ts">
import Stack from './Stack.svelte'

export let cards = [];
</script>

<div class="deck">
    <span>{ cards.length }</span>
    <Stack on:click cards={ [] } />
</div>

<style>
/*     .deck :global(.card) {
        position: absolute;
        transform: translateY(0em);
        box-shadow: none;
    } */
    span {
        color: white;
        position: absolute;
    }
</style>