<script lang="ts">
  import { fade } from "svelte/transition";
  export let message;
  export let mayPass = false;

  let text = "";

  $: {
    switch (message) {
      case "gameOver":
        text = "Game over!";
        break;

      case "playCard":
        text = `You must play a card from your hand${
          mayPass ? " or pass." : "."
        }`;
        break;

      case "claimCircles":
        text = "You may claim one or more circles or pass.";
        break;

      case "drawCard":
        text = `You must draw a card${
            mayPass ? " or pass." : "."
        }`;
        break;

      case "wait":
        text = "Waiting for your opponent to finish their move.";
        break;

      default:
        text = message;
        break;
    }
  }
</script>

{#each [text] as text (text)}
<div class="message">
  <p id="text" transition:fade={{ duration: 300 }}>{@html text}</p>
  
  {#if mayPass}
    <button on:click transition:fade={{ duration: 300 }}>Pass</button>
  {/if}
</div>
{/each}

<style>
  .message {
    grid-area: message;
    align-self: center;
    display: flex;
    flex-direction: column;
    justify-items: flex-start;
    align-items: center;
    color: rgb(224, 224, 224);
    text-align: center;
    cursor: default;
    user-select: none;
    height: 4em;
  }

  #text {
    max-width: fit-content
  }

  button {
    border-radius: 0.5rem;
    padding: 0.3rem 0.5rem;
    margin: 0.2rem;
    background-color: rgb(199, 221, 223);
    border: 2px solid rgb(53, 97, 91);
    box-shadow: 0 0 0.2em rgba(3, 27, 31, 0.4);
    transition: all 200ms ease-out;
  }

  button:hover {
    background-color: rgb(255, 255, 255);
  }

  button:focus {
    outline: 0;
    box-shadow: 0 0 0.1em 0.2em rgba(222, 233, 143, 0.4);
  }
</style>
