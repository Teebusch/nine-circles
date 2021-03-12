<script lang="ts">
import Slot from './Slot.svelte';

export let cards = [];
</script>

<Slot {cards}/>  

<style>
.discard .card {
    transform-origin: bottom left;
}

.discard .card:nth-child(1) {
    transform: rotate(-1deg) translateY(calc(var(--card-h) * (-1/4)));
}
.discard .card:nth-child(2) {
    transform: rotate(2deg);
}
</style>