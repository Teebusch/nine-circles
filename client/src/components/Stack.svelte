<script type="ts">
  import Card from "./Card.svelte";

  export let cards = [];
  export let active = false;
</script>

<div class="stack" class:empty={cards.length === 0} class:active on:click>
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
    grid-template-rows: repeat(6, calc(1 / 4 * var(--card-h)));
  }

  .stack.empty {
    color: rgb(72, 97, 91);
    border: 1px dashed rgb(1, 15, 12);
  }

  .stack.active,
  .stack.active > :global(.card) {
    cursor: pointer;
    border: 1px solid rgb(43, 80, 72);
    box-shadow: rgba(126, 235, 220, 0.1) 0 0 0.5em;
  }

  .stack.active:hover {
    background: rgba(61, 204, 192, 0.2);
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
  }

  .stack.active > :global(.card) {
    transition: filter 200ms ease;
  }

  .stack.active:hover > :global(.card) {
    filter: brightness(1.2);
  }
</style>
