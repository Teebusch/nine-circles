<script type="ts"> 
import Stack from './components/Stack.svelte'
import Message from './components/Message.svelte'
import Deck from './components/Deck.svelte'
import Flag from './components/Flag.svelte'
import Hand from './components/Hand.svelte'
import Discard from './components/Discard.svelte';
import type { GameState, Circle } from './Game';
import type { Card } from './cards';
import App from './App.svelte';

export let client;

let G: GameState;
$: G = $client.G;
$: ctx = $client.ctx;

// use this until figured out multiplayer
$: pId = ctx.currentPlayer;
$: oppId = pId == '0' ? '1' : '0';
$: stage = ctx.activePlayers[pId];
$: hand = G.players[pId].hand;
$: playable = G.players[pId].playable;

let selectedCard: Card | null;
$: selectedCard = null;

let message: string;
let mayPass = false;

$: {
    if (ctx.gameover) {
        message = 'gameOver';
        mayPass = false;
    } else {
        message = stage;
        mayPass = false;

        switch (stage) {
            case 'playCard':
                const plbl = Object.values(playable);
                if (plbl.length === 0 || plbl.every((e) => !e)) {
                    mayPass = true;
                };
                break;

            case 'claimCircles':
                mayPass = true;
                // ToDO: auto-pass when there are no claimable circles.
                break;
                
            case 'drawCard':
                if (G.tactics.length == 0 && G.troops.length == 0) {
                    mayPass = true;
                }
                break;
        }
    }
}

function selectCircle(crc: Circle) {
    if (stage == 'playCard') {
        if (selectedCard && !crc.winner) {
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
    if (mayPass) {
        client.moves.pass();
    }
}

function getWinner(crc: Circle) {
    if (crc.winner) {
       return crc.winner === pId ? 'self' : 'opponent';
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
                <Stack cards = { crc.cards[oppId] } />
            </div>
            <Flag 
                wonBy = { getWinner(crc) } 
                on:click = { () => claimCircle(crc) } 
                active = { stage == 'claimCircles' && !crc.winner && crc.claimable[pId] } 
            /> 
            <div class="self">
                <Stack 
                    cards = { crc.cards[pId] } 
                    active = { stage == 'playCard' && selectedCard && !crc.winner && crc.cards[pId].length < crc.maxCards }
                    on:click = { () => selectCircle(crc) } 
                />
            </div>
        {/each}
    </div>

    <Message { message } mayPass = { mayPass } on:click={ pass } />
    <Hand cards = { hand } playable = { playable } bind:selected = { selectedCard } active={ stage == 'playCard' } />
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