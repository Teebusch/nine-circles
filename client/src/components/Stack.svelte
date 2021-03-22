<script type="ts">
import Card from './Card.svelte'

export let cards = [];
export let available = false;
</script>

<div class="stack" class:empty="{cards.length === 0}" class:available on:click>
    {#each cards as card (card.id)}
        <Card {card} />
    {/each}
</div>


<style>

.stack {
    width: var(--card-w);
    height: calc(var(--card-h));
    text-align: center;
    border-radius: var(--card-r);
    display: grid;
    grid-template-rows: repeat(6, calc(1/4*var(--card-h)));
}

.stack.empty {
    color: rgb(72, 97, 91);
    border: 1px dashed rgb(72, 97, 91);
}

.stack.available, .stack.available > :global(.card) {
    cursor: pointer;
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
}

.stack.available:hover {
    background: rgba(216, 216, 214, 0.2);
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
}

.stack.available > :global(.card) {
    transition: filter 200ms ease;
}

.stack.available:hover > :global(.card) {
    filter: brightness(1.2);
}



</style>