<script lang="ts">
import Stack from './Stack.svelte';

export let cards = [];
</script>

<Stack {cards}/>  

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