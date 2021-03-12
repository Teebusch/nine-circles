<script type="ts"> 

import { onMount } from 'svelte';
import Slot from './components/Slot.svelte'
import Message from './components/Message.svelte'
import Deck from './components/Deck.svelte'
import Flag from './components/Flag.svelte'
import Hand from './components/Hand.svelte'
import Discard from './components/Discard.svelte';
import type { GameState } from './Game';

export let client;

let G: GameState;
$: G = $client.G;
$: ctx = $client.ctx;

const messages = [
    "<h2>It's your turn!</h2> You must play a card from your hand."
];

let message = messages[0];
let selectedCard = null;
let selectedSlot = null;

$: { message = `Selected card ${ selectedCard }`; }

function isAvailable(s: Slot): boolean {
    return selectedCard !== null && 
        !s.won && 
        s.cards[ctx.currentPlayer].length < s.maxCards;
}

function selectSlot(slotIdx: number) {
    if (selectedCard !== null) {
        message = `Selected slot ${ slotIdx }`
        client.moves.playCard(selectedCard, slotIdx)
        selectedCard = null;
    }
}

function drawTactic(e) {
    message = `Drawing Tactic`
    client.moves.drawTactic();
}

function drawTroop(e) {
    message = `Drawing Troop`
    client.moves.drawTroop();
}

</script>

<div class="board-wrapper">
    <div class="decks">
        <Deck cards={ G.troops } on:click={ drawTroop } />
        <Deck cards={ G.tactics } on:click={ drawTactic } />
    </div>

    <div class="discard">
        <Discard cards={ G.discarded } />   
    </div>

    <div class="p1">
        {#each G.slots as s}
        <Slot />
        {/each}
    </div>
    <div class="flags">
        {#each G.slots as s}
        <Flag />  
        {/each}
    </div>
    <div class="p2">
        {#each G.slots as s, id}
        <Slot 
            cards = { s.cards[ctx.currentPlayer] } 
            available = { (s) => isAvailable(s) }
            on:click = { () => { if (isAvailable(s)) selectSlot(id) } } 
        />
        {/each}
    </div>
    <Message { message } />
    <Hand 
        cards = { G.players[ctx.currentPlayer].hand } 
        bind:selected = { selectedCard } 
    />
</div>


<style>

.board-wrapper {
    max-width: 100vw;
    padding: 1vmax;
    display: grid;
    grid-template-columns: var(--card-w) auto;
    grid-auto-rows: max-content;
    grid-template-areas: 
        'decks p1' 
        'decks flags' 
        'decks p2' 
        '. message' 
        'discard hand';
    row-gap: 1em;
    column-gap: 2em;
    padding-top: 2em;
    justify-content: center;
}

.p1, .flags, .p2 {
    display: grid;
    grid-template-columns: repeat(9, auto);
    column-gap: calc(var(--card-w) / 6);
    justify-items: center;
}

.p1, .p2 {
    align-items: start;
}

.p1 {
    transform: scaleY(-1);
} 

.flags {
    grid-area: flags;
    align-items: center;
    z-index: -1;
}

.discard {
    grid-area: discard;
    position: relative;
}

.decks {
    grid-area: decks;
    display: flex;
    gap: 2em;
    flex-direction: column;
    justify-content: center;
}


</style>