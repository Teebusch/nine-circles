<script type="ts">
  import Card from "./Card.svelte";
  import { flip } from 'svelte/animate';
  import { quintOut } from "svelte/easing";
  import { fly } from "svelte/transition"

  const swoosh = function (node, params) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    return {
      duration: 600,
      easing: quintOut,
      css: (t) => `
            transform: ${transform} scale(${t});
            opacity: ${t}
        `,
    };
  };

  export let cards = [];
  export let active = false;
</script>

<div class="stack" class:active on:click>
  {#if cards.length === 0}
    <div class="placeholder" />
  {:else}
    {#each cards as card (card.id)}
    <div class="card-wrapper" 
      animate:flip  
      in:fly={{y: 50, duration: 500, opacity: 0.5, easing: quintOut}} 
      out:swoosh
    >
      <Card {card} />
    </div>
    {/each}
  {/if}
</div>

<style>
  .stack {
    width: var(--card-w);
    height: calc(var(--card-h) * (7 / 4));
    border-radius: var(--card-r);
    display: grid;
    grid-template-rows: repeat(7, calc(1 / 4 * var(--card-h)));
  }

  .placeholder {
    width: var(--card-w);
    height: calc(var(--card-h));
    border-radius: var(--card-r);
    color: rgb(72, 97, 91);
    border: 1px dashed rgb(1, 15, 12);
  }

  .stack.active > :global(.card) {
    cursor: pointer;
    box-shadow: rgba(126, 235, 220, 0.1) 0 0 0.5em;
    transition: filter 200ms ease;
  }
  
  .stack.active:hover > :global(.card) {
    filter: brightness(1.2);
  }
  
  .stack.active > .placeholder {
    cursor: pointer;
    box-shadow: rgba(126, 235, 220, 0.1) 0 0 0.5em;
    border: 1px solid rgb(43, 80, 72);
    transition: all 200ms ease;
  }

  .stack.active:hover > .placeholder {
    background: rgba(61, 204, 192, 0.2);
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
  }

</style>
