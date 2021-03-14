<script lang="ts">
import Card from './Card.svelte';
import { fade } from 'svelte/transition';

function clickCard(idx: number) {
    selected = selected === idx ? null : idx;
}

export let cards = [];
export let selected = null;
</script>

<div class="hand">
    {#each cards as card, idx}
    <Card {card} isSelected={ selected === idx } on:click={ () => clickCard(idx) } />
    {/each}
</div>

<style>
.hand {
    grid-area: hand;
    justify-self: center;
    padding: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: calc(var(--card-w) / 6);
    background: rgba(90, 114, 107, 0.3);
    border-radius: calc(1.2 * var(--card-r));
    transform: scale(1.1);
    width: min-content;
    height: min-content;
}


.hand :global(.card) {
    position: relative;
    transition: all 200ms ease-out;
}

.hand :global(.card:hover) {
    box-shadow: 0 1em 1em rgba(0, 0, 0, 0.3);
    transform: scale(1.1) translateY(-0.5em);
}

.hand :global(.card.selected) {
    box-shadow: 0 2em 1em rgba(0, 0, 0, 0.3);
    transform: scale(1.1) translateY(-15%);
}

.hand :global(.card.selected:hover) {
    transform: scale(1.1) translateY(-2em);
}
</style>