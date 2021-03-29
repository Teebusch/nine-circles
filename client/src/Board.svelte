<script type="ts">
  import Stack from "./components/Stack.svelte";
  import Message from "./components/Message.svelte";
  import Deck from "./components/Deck.svelte";
  import Flag from "./components/Flag.svelte";
  import Hand from "./components/Hand.svelte";
  import Discard from "./components/Discard.svelte";
  import type { GameState, Circle } from "./Game";
  import type { Ctx } from "boardgame.io";
  import type { Card } from "./cards";
  import { afterUpdate } from "svelte";

  export let client;

  let G: GameState;
  let ctx: Ctx;

  $: G = $client.G;
  $: ctx = $client.ctx;

  // use this until figured out multiplayer
  $: pId = ctx.currentPlayer;
  $: oppId = pId == "0" ? "1" : "0";
  $: idString = { [pId]: "self", [oppId]: "opponent" };

  $: hand = G.players[pId].hand;
  $: playable = G.players[pId].playable;
  $: stage = ctx.activePlayers[pId];
  $: message = ctx.gameover ? "gameover" : stage;

  let selectedCard: Card | null;
  let mayPass;

  $: {
    if (ctx.gameover) {
      mayPass = false;
    } else {
      switch (stage) {
        case "playCard":
          const plbl = Object.values(playable);
          mayPass = plbl.length === 0 || plbl.every((e) => !e);
          break;

        case "claimCircles":
          mayPass = true;
          break;

        case "drawCard":
          mayPass = G.tactics.length == 0 && G.troops.length == 0;
          break;
      }
    }
  }

  // auto-pass when there are no claimable circles
  // it works, but I don't think this is the idiomatic way to do it.
  afterUpdate(() => {
    if (
      stage == "claimCircles" &&
      !G.circles.some((e) => e.winner === pId && !e.claimedBy)
    ) {
      pass();
    }
  });

  // Moves

  function selectCircle(crc: Circle) {
    if (stage == "playCard") {
      if (selectedCard && !crc.claimedBy) {
        client.moves.playCard(selectedCard.id, crc.id);
        selectedCard = null;
      }
    }
  }

  function claimCircle(crc: Circle) {
    if (stage == "claimCircles") {
      client.moves.claimCircle(crc.id);
    }
  }

  function drawTactic() {
    if (stage == "drawCard") {
      client.moves.drawTactic();
    }
  }

  function drawTroop() {
    if (stage == "drawCard") {
      client.moves.drawTroop();
    }
  }

  function pass() {
    if (mayPass) {
      client.moves.pass();
    }
  }
</script>

<div class="board-wrapper">
  <div class="decks">
    <Deck
      deck="Troops"
      nCards={G.troops.length}
      active={stage == "drawCard"}
      on:click={drawTroop}
    />
    <Deck
      deck="Tactics"
      nCards={G.tactics.length}
      active={stage == "drawCard"}
      on:click={drawTactic}
    />
  </div>

  <div class="discard">
    <Discard cards={G.discarded} />
  </div>

  <div class="circles">
    {#each G.circles as crc}
      <div class="opponent">
        <Stack cards={crc.cards[oppId]} />
      </div>
      <Flag
        wonBy={idString[crc.claimedBy]}
        on:click={() => claimCircle(crc)}
        active={stage == "claimCircles" && !crc.claimedBy && crc.winner === pId}
      />
      <div class="self">
        <Stack
          cards={crc.cards[pId]}
          active={stage == "playCard" &&
            selectedCard &&
            !crc.claimedBy &&
            crc.cards[pId].length < crc.maxCards}
          on:click={() => selectCircle(crc)}
        />
      </div>
    {/each}
  </div>

  <Message {message} {mayPass} on:click={pass} />

  <Hand
    cards={hand}
    {playable}
    bind:selected={selectedCard}
    active={stage == "playCard"}
  />
</div>

<style>
  .board-wrapper {
    padding: 1vmax;
    display: grid;
    grid-template-columns: var(--card-w) auto;
    grid-auto-rows: max-content;
    grid-template-areas:
      "decks circles"
      ". message"
      "discard hand";
    row-gap: 1em;
    column-gap: 2em;
    padding-top: 2em;
    justify-content: center;
  }

  .decks {
    grid-area: decks;
    display: flex;
    gap: 2em;
    flex-direction: column;
    justify-content: center;
  }

  .circles {
    grid-area: circles;
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: 1fr min-content 1fr;
    grid-auto-flow: column;
    column-gap: calc(var(--card-w) / 6);
    row-gap: calc(var(--card-h) / 10);
    padding: calc(var(--card-h) * 0.25) 0;
  }

  .opponent {
    transform: rotate(180deg);
  }

  :global(.opponent .card) {
    transform: rotate(180deg);
  }

  .discard {
    grid-area: discard;
  }
</style>
