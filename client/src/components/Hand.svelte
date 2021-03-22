<script lang="ts">
import Card from './Card.svelte';
import { flip } from 'svelte/animate';


function clickCard(idx: number) {
    selected = selected === idx ? null : idx;
}

export let cards = [];
export let selected = null;

</script>

{#if cards.length > 0}
<div class="hand">
    {#each cards as card, idx (card)}
    <div animate:flip>
        <Card 
            { card } 
            selected={ selected === idx } 
            on:click={ () => clickCard(idx) } 
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


.hand :global(.card) {
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