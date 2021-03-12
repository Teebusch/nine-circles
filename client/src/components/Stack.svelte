<script type="ts">
import Card from './Card.svelte'

export let cards = [];
export let available = false;
</script>

<div class="stack" class:empty="{cards.length === 0}" class:available on:click>
    {#each cards as card}
        <Card {card} />
    {/each}
</div>


<style>
    
.stack {
    width: var(--card-w);
    height: var(--card-h);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: var(--card-r);
    transition: all 200ms ease;
    flex-direction: column;
}

.stack.empty {
    color: rgb(72, 97, 91);
    border: 1px dashed rgb(72, 97, 91);
}

.stack.available, .stack.available > * {
    cursor: pointer;
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
}

.stack.available:hover {
    background: rgba(216, 216, 214, 0.2);
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
}

.stack.available:hover > * {
    filter: brightness(1.3);
}

.p1 .stack, .p2 .stack {
    margin-bottom: calc(var(--card-h) * (1/2));
}

.stack :global(.card:nth-child(1)) {
    transform: translateY(0em) rotate(0.5deg);
}
.stack :global(.card:nth-child(2)) {
    transform: translateY(calc(var(--card-h) * (1/4))) rotate(-0.5deg);
}
.stack :global(.card:nth-child(3)) {
    transform: translateY(calc(var(--card-h) * (1/2))) rotate(0.5deg);
}
.stack :global(.card:nth-child(4)) {
    transform: translateY(calc(var(--card-h) * (3/4))) rotate(-0.5deg);
}

.stack :global(.card) {
    position: absolute;
}

</style>