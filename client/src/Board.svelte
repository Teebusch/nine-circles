<script type="ts"> 
import Stack from './components/Stack.svelte'
import Message from './components/Message.svelte'
import Deck from './components/Deck.svelte'
import Flag from './components/Flag.svelte'
import Hand from './components/Hand.svelte'
import Discard from './components/Discard.svelte';
import type { GameState, Circle } from './Game';
import type { Card } from './cards';

export let client;

let G: GameState;
$: G = $client.G;
$: ctx = $client.ctx;

// use this until figured out multiplayer
$: idSelf = ctx.currentPlayer;
$: idOppo = idSelf == '0' ? '1' : '0';
$: stage = ctx.activePlayers[idSelf];
$: hand = G.players[idSelf].hand;

let selectedCard: Card | null;
$: selectedCard = null;

let message: string;

// $: circleWinners = G.circles.map((c) => {
//     if (c.winner == idSelf) {
//          return 'self'
//     } else if (c.winner == idOppo) {
//         return 'opponent'
//     } else {
//         return null
//     }
// })

$: {
    switch (stage) {
        case 'playCard':
            message = 'You must play a card from your hand (or pass).';
            break;

        case 'claimCircles':
            message = 'You may claim one or more circles.';
            break;

        case 'drawCard':
            message = 'You must draw a card (or pass).';
            break;

        default:
            message = 'Waiting for your opponent to finish their move.'
            break;
    }
}

function selectCircle(crc: Circle) {
    if (stage == 'playCard') {
        if (selectedCard && crc.available) {
            client.moves.playCard(selectedCard.id, crc.id);
            selectedCard = null;
        }
    }
}

function claimCircle(crc: Circle) {
    if (stage == 'claimCircles') {
        client.moves.claimCircle(crc.id);
    }
}

function drawTactic() {
    if (stage == 'drawCard') {
        client.moves.drawTactic();
    }
}

function drawTroop() {
    if (stage == 'drawCard') {
        client.moves.drawTroop();
    }
}

function pass() {
    // ToDo: if player may pass...
    client.moves.pass();
}

function getWinner(crc: Circle) {
    if (crc.winner) {
       return crc.winner === idSelf ? 'self' : 'opponent';
    } else {
        return null
    } 
}

</script>

<div class="board-wrapper">
    <div class="decks">
        <Deck deck="Troops" nCards={ G.troops.length } active={ stage == 'drawCard' } on:click={ drawTroop } />
        <Deck deck="Tactics" nCards={ G.tactics.length }  active={ stage == 'drawCard' } on:click={ drawTactic } />
    </div>

    <div class="discard">
        <Discard cards={ G.discarded } />   
    </div>

    <div class="circles">
        {#each G.circles as crc}
            <div class="opponent">
                <Stack cards = { crc.cards[idOppo] } />
            </div>
            <Flag wonBy = { getWinner(crc) } on:click = { () => claimCircle(crc) } active={ stage == 'claimCircles' && !getWinner(crc) } /> 
            <div class="self">
                <Stack 
                    cards = { crc.cards[idSelf] } 
                    active = { stage == 'playCard' && selectedCard && !getWinner(crc) }
                    on:click = { () => selectCircle(crc) } 
                />
            </div>
        {/each}
    </div>

    <Message { message } on:click={ pass } />
    <Hand cards = { hand } bind:selected = { selectedCard } active={ stage == 'playCard' } />
</div>


<style>

.board-wrapper {
    padding: 1vmax;
    display: grid;
    grid-template-columns: var(--card-w) auto;
    grid-auto-rows: max-content;
    grid-template-areas: 
        'decks circles'
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