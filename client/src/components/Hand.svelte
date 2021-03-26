<script lang="ts">
import Card from './Card.svelte';
import type { Card as CardT, Stack } from '../cards'
import { flip } from 'svelte/animate';

export let active = false;
export let cards: Stack = [];
export let playable = {}; 
export let selected: CardT | null = null;

function clickCard(card: CardT) {
    if(selected && selected.id === card.id) {
        selected = null
    } else if (active && playable[card.id]) {
        selected = card
    }
}

</script>

{#if cards.length > 0}
<div class="hand" class:active>
    {#each cards as card (card.id)}
    <div class="card-wrapper" class:active={ playable[card.id] } animate:flip >
        <Card 
            { card } 
            selected = { selected && selected.id === card.id } 
            on:click = { () => clickCard(card) } 
        />
    </div>
    {/each}
</div>
{/if}

<style>

.card-wrapper:not(.active) {
    filter: saturate(0.2) brightness(0.3);
}

.hand {
    grid-area: hand;
    justify-self: center;
    padding: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row-reverse;
    gap: calc(var(--card-w) / 6);
    background: rgba(90, 114, 107, 0.3);
    border-radius: calc(1.2 * var(--card-r));
    width: min-content;
    height: min-content;
}

.hand.active {
    /* background: rgba(174, 192, 186, 0.5); */
    box-shadow: rgba(91, 168, 158, 0.5) 0 0 1em;
}


.hand.active :global(.card) {
    cursor: pointer;
}

.hand :global(.card) {
    transition: all 200ms ease-out;
}

.hand.active :global(.card:hover) {
    box-shadow: 0 1em 1em rgba(0, 0, 0, 0.3);
    transform: scale(1.1) translateY(-0.5em);
}

.hand.active :global(.card.selected) {
    box-shadow: 0 2em 1em rgba(0, 0, 0, 0.3);
    transform: scale(1.1);
    animation: 1s ease-in-out 0s infinite alternate bob;
}

.hand.active :global(.card.selected:hover) {
    transform: scale(1.1) translateY(-2em);
}

@keyframes bob {
  from { transform: scale(1.1) translateY(-0.5em) }
  to   { transform: scale(1.1) translateY(-15%); }
}

</style>