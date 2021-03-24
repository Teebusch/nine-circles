<script lang="ts">
import Card from './Card.svelte';
import type { Card as CardT, Stack } from '../cards'
import { flip } from 'svelte/animate';

export let active = false;
export let cards: Stack = [];
export let selected: CardT | null = null;

function clickCard(clicked: CardT) {
    if(selected && selected.id === clicked.id) {
        selected = null
    } else {
        selected = clicked
    }
}
</script>

{#if cards.length > 0}
<div class="hand" class:active>
    {#each cards as card (card.id)}
    <div animate:flip>
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

.hand.hand.active {
    /* background: rgba(174, 192, 186, 0.5); */
    box-shadow: rgba(91, 168, 158, 0.5) 0 0 1em;
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
    transform: scale(1.1) translateY(-15%);
}

.hand.active :global(.card.selected:hover) {
    transform: scale(1.1) translateY(-2em);
}
</style>