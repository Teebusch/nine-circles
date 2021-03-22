<script type="ts"> 
import Stack from './components/Stack.svelte'
import Message from './components/Message.svelte'
import Deck from './components/Deck.svelte'
import Circle from './components/Circle.svelte'
import Hand from './components/Hand.svelte'
import Discard from './components/Discard.svelte';
import type { GameState, Slot } from './Game';

export let client;

let G: GameState;
$: G = $client.G;
$: ctx = $client.ctx;

// use this until figured out multiplayer
$: pSelf = ctx.currentPlayer;
$: pOther = pSelf == 0 ? 1 : 0;
$: stage = ctx.activePlayers[pSelf];
$: hand = G.players[pSelf].hand;

const messages = [
    "<h2>It's your turn!</h2> You must play a card from your hand."
];

let message = messages[0];
let selectedCard = null;
let selectedSlot = null;

$: { message = `${ stage }, Self: ${ pSelf } Other: ${ pOther }`; }

let slotAvailable: Array<boolean> 
$: slotAvailable = G.slots.map((s: Slot) => {
    return selectedCard !== null && 
        s.claimedBy === null && 
        s.cards[pSelf].length < s.maxCards;
});

function selectSlot(slotId: number) {
    if (selectedCard !== null) {
        client.moves.playCard(selectedCard, slotId);
        selectedCard = null;
    }
}

function claimCircle(circleId) {
    message = `Claiming circle ${ circleId }`;
    client.moves.claimCircle(circleId);
}

function drawTactic(e) {
    message = `Drawing Tactic`
    client.moves.drawTactic();
}

function drawTroop(e) {
    message = `Drawing Troop`
    client.moves.drawTroop();
}

function pass(e) {
    message = `Passing`
    client.moves.pass();
}

</script>

<div class="board-wrapper">
    <div class="decks">
        <Deck deck="Troops" numCards={ G.troops.length } on:click={ drawTroop } />
        <Deck deck="Tactics" numCards={ G.tactics.length } on:click={ drawTactic } />
    </div>

    <div class="discard">
        <Discard cards={ G.discarded } />   
    </div>

    <div class="slots">
        {#each G.slots as s, id}
            <div class="pOther">
                <Stack cards = { s.cards[pOther] } />
            </div>
            <Circle on:click = { () => claimCircle(id) } />  
            <div class="pSelf">
                <Stack 
                    cards = { s.cards[pSelf] } 
                    available = { slotAvailable[id] }
                    on:click = { () => { if (slotAvailable[id]) selectSlot(id) } } 
                />
            </div>
        {/each}
    </div>

    <Message { message } on:click={ pass } />
    <Hand cards = { hand } bind:selected = { selectedCard } />
</div>


<style>

.board-wrapper {
    padding: 1vmax;
    display: grid;
    grid-template-columns: var(--card-w) auto;
    grid-auto-rows: max-content;
    grid-template-areas: 
        'decks slots'
        '. message' 
        'discard hand';
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

.slots {
    grid-area: slots;
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

.pOther {
    transform: rotate(180deg);
}

:global(.pOther .card) {
    transform: rotate(180deg);
}

.discard {
    grid-area: discard;
}
</style>