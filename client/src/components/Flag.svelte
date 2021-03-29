<script lang="ts">
  export let wonBy = null;
  export let active = false;
</script>

<div
  class="flag"
  class:active
  class:opponent-won={wonBy == "opponent"}
  class:self-won={wonBy == "self"}
  on:click
/>

<style>
  .flag {
    border: max(2px, 0.3em) solid rgb(53, 97, 91);
    border-radius: 50%;
    width: calc(var(--card-w) / 3);
    height: calc(var(--card-w) / 3);
    transition: transform 500ms ease-in-out;
  }

  .flag.active {
    cursor: pointer;
    border-color: rgb(160, 221, 207);
    box-shadow: rgba(126, 235, 220, 0.5) 0 0 0.5em;
    transition: filter 200ms ease;
  }

  .flag.active:hover {
    filter: brightness(1.2);
    box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
  }

  .flag.opponent-won {
    transform: translateY(calc(var(--card-w) / -3));
    border-color: white;
    background: white;
    box-shadow: rgb(209, 192, 147) 0 0 1em;
    z-index: -1;
  }

  .flag.self-won {
    transform: translateY(calc(var(--card-w) / 3));
    border-color: white;
    background: white;
    box-shadow: rgb(209, 192, 147) 0 0 1em;
    z-index: -1;
  }
</style>
