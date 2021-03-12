<script type="ts">
import Slot from './Slot.svelte'

export let cards = [];
</script>

<div class="deck">
    <span>{ cards.length }</span>
    <Slot on:click cards={ [] } />
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