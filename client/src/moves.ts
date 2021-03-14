
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx } from 'boardgame.io';
import type {GameState, Slot } from './Game'
import type { Stack } from './cards'

// Moves the active player can make
// There is a fixed order: (1) play a card, (2) claim circles, (3) draw a new card

// Play a card from the hand onto one of the 9 Slots 
// or -for certain tactics cards- use the card's effect.
function playCard (G: GameState, ctx: Ctx, cardIdx: number, slotIdx: number): void | typeof INVALID_MOVE {
    const handSize = G.players[ctx.currentPlayer].hand.length
    if (handSize === 0) {
        // if there are no cards in hand, end stage immediately
        // ToDo: Hand might consist of unplayable cards only...
        ctx.events.endStage()
    } else if (slotIdx >= 0 && slotIdx <= handSize) {
        const card = G.players[ctx.currentPlayer].hand.splice(cardIdx, 1)[0];
        G.slots[slotIdx].cards[ctx.currentPlayer].push(card);
        ctx.events.endStage();
    } else {
        return INVALID_MOVE
    }
}

// Claim any number of won circles 
function claimCircles (G: GameState, ctx: Ctx, circleIdx: number): void | typeof INVALID_MOVE {
    G.slots.forEach((s, i) {
        // ...
    });
    if (checkGameEnd(G, ctx)){
        ctx.events.endGame();
    } else {
        ctx.events.endStage();
    }
}

// Draw a card from either the 'troops' or 'tactics' deck (if available)
function drawCard (G: GameState, ctx: Ctx, deck: string): void | typeof INVALID_MOVE {
    if (G[deck].length > 0) {
        const card = G[deck].pop();
        G.players[ctx.currentPlayer].hand.unshift(card);
        ctx.events.endStage()
    } else if (G.tactics.length === 0 && G.troops.length === 0) {
        // if both decks are empty, skip the stage
        ctx.events.endStage();
    } else {
        return INVALID_MOVE;
    }
}

// wrappers for drawCard
const drawTroop = (G, ctx) => drawCard(G, ctx, 'troops')
const drawTactic = (G, ctx) => drawCard(G, ctx, 'tactics')


// Determine if game end condition is reached.
// Game end is checked whenever a circle is claimed.
// Game ends immediately if player has won 5 total or 3 adjecent circles
function checkGameEnd (G: GameState, ctx: Ctx): void | number  {

    let total = {};
    let adjacent = {};

    for (const s of G.slots) {
        const id = s.claimedBy;
        if (id !== null) {
            total[id] = total[id] + 1 || 0;
            if (adjacent[id]) {
                adjacent[id] = adjacent[id] + 1 || 1;
            } else {
                adjacent = {};
            }
        };
        if (total[id] == 5 || adjacent[id] == 3) {
            return id;
        }
    };
}


// Scoring of slots

interface ScoringFunc {
    (stack: Stack): [4 | 3 | 2 | 1 | 0, number];
}

let score_default: ScoringFunc;
let score_sum: ScoringFunc;

// Straight (consecutive numbers)
function is_straight(stack: Stack): boolean {
    //stack.sort((a,b) => a.value - b.value); 
    return false;
}

// Flush (same color)
function is_flush(stack: Stack): boolean {
    // stack.every(e => e.suit === stack[0].suit);
    return false;
}

// N of a kind (same number)
function is_onekind(stack: Stack): Boolean {
    // stack.every(e => e.value === stack[0].value);  
    return false;
}

// Sum of card values
// used when no formation or as tie breaker
function sum_values(stack: Stack): number {
    let value = stack
    .map(c => c.value)
    .map(e => Array.isArray(e) ? Math.max(...e) : e)
    .reduce((acc, val) => acc + val, 0);
    return 0;
}

score_default = function(stack) {

    let scr_frm: number = 0;
    let scr_val: number = 0;

    if (is_straight && is_flush) {
        scr_frm = 4;
    } else if (is_onekind) {
        scr_frm = 3;
    } else if (is_flush) {
        scr_frm = 2;
    } else if (is_straight) {
        scr_frm = 1;
    }

    scr_val = sum_values(stack)
    
    return [scr_frm, scr_val];
}

score_sum = function(stack) {
    return [0, 0];
}


export { playCard, claimCircles, drawTroop, drawTactic }