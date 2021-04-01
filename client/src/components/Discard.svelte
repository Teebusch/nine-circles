<script lang="ts">
  export let cards = [];
  export let active = false;
</script>

<div class="deck">
  {#if cards.length > 0}
    <div class="card" class:active={active && cards.length > 0} on:click>
      <span>{cards.length}</span>
    </div>
  {:else}
  <div class="placeholder">
      <button on:click>Debug</button>
    </div>
  {/if}
</div>


<style>
.deck {
    text-align: center;
    color: white;
  }

  .placeholder {
    background: none;
    box-shadow: none;
    border: 1px dashed rgb(72, 97, 91);
    width: var(--card-w);
    height: var(--card-h);
    border-radius: var(--card-r);
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
