<script lang="ts">
  export let cards = [];
</script>

<span>{ `Discarded: ${cards.length || 0}`}</span>

<button on:click>Debug</button>

<style>
  span {
    color: white;
  }

  /* .discard .card {
    transform-origin: bottom left;
  }
  .discard .card:nth-child(1) {
    transform: rotate(-1deg) translateY(calc(var(--card-h) * (-1 / 4)));
  }
  .discard .card:nth-child(2) {
    transform: rotate(2deg);
  } */
</style>
