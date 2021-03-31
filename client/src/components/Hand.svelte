<script lang="ts">
  import Card from "./Card.svelte";
  import type { Card as CardT, Stack } from "../cards";
  import { flip } from "svelte/animate";
  import { cubicOut, elasticOut } from "svelte/easing";
  import { fly } from 'svelte/transition';

  export let active = false;
  export let cards: Stack = [];
  export let playable = {};
  export let selected: CardT | null = null;

  function clickCard(card: CardT) {
    if (selected && selected.id === card.id) {
      selected = null;
    } else if (active) {
      selected = card;
    }
  }
</script>

{#if cards.length > 0}
  <div class="hand" id="hand" class:active>
    {#each cards as card (card.id)}
      <div class="card-wrapper" class:active={playable[card.id]} 
        animate:flip={{easing: elasticOut, duration: 1000}}
        in:fly={{x: -90, duration: 700, opacity: 0.5, easing: elasticOut}}
        out:fly={{y: -90, duration: 400, opacity: 0, delay: -400}}
      >
        <Card
          {card}
          selected={selected && selected.id === card.id}
          on:click={() => clickCard(card)}
        />
      </div>
    {/each}
  </div>
{/if}

<style>

  .card-wrapper {
    height: var(--card-h);
    width: var(--card-w);
  }
  .card-wrapper:not(.active) {
    filter: saturate(0) brightness(0.7);
    /* pointer-events: none; */
  }

  .hand {
    grid-area: hand;
    justify-self: center;
    padding: 0.7em;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row-reverse;
    gap: calc(var(--card-w) / 6);
    background:rgba(2, 30, 41, 0.5);
    box-shadow: 0 1em 1em -0.2em rgba(2, 14, 12, 0.5);
    border-radius: calc(1.2 * var(--card-r));
    width: min-content;
    height: var(--card-h);
  }

  .hand.active {
    border-bottom: 3px solid rgb(197, 240, 240);
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
    from {
      transform: scale(1.1) translateY(-0.5em);
    }
    to {
      transform: scale(1.1) translateY(-15%);
    }
  }

</style>
