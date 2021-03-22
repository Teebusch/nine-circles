
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx } from 'boardgame.io';
import type {GameState, Slot } from './Game'
import type { Stack } from './cards'

// Moves the active player can make. There is a fixed order: 
// (1) play a card, (2) claim circles, (3) draw a new card
// under sime circumstances the player can/must also pass
// Not all stages will always be possible

function pass (F: GameState, ctx: Ctx): void | string {
    const stage: string = ctx.activePlayers[ctx.currentPlayer];
    switch (stage) {
        case 'playCard':
            // If there are no cards in hand, or only unplayable cards 
            // in hand, may pass playCard stage.
            if (true) {
                ctx.events.endStage();
                break;
            } else {
                return INVALID_MOVE;
            }
        case 'claimCircles':
            // If there are no cicrles to be claimed, or they don't want
            // to claim any claimable circles, player may pass.
            if (true) {
                ctx.events.endStage();  
                break;
            } else {
                return INVALID_MOVE;
            }
            case 'drawCard':
            // If there are no cards left to draw, player may pass.
            //if (G.tactics.length == 0 && G.troops.length == 0) {
            if (true) {
                ctx.events.endTurn();
                break; 
            } else {
                return INVALID_MOVE;
            }
        default:
            return INVALID_MOVE;
    } 
}

// Play a card from the hand onto one of the 9 Slots 
// or -for certain tactics cards- use the card's effect.
function playCard (G: GameState, ctx: Ctx, cardIdx: number, slotIdx: number): void | typeof INVALID_MOVE {
    const handSize = G.players[ctx.currentPlayer].hand.length
    if (handSize === 0 || cardIdx > handSize-1 || cardIdx < 0) {
        return INVALID_MOVE
    } else if (G.slots[slotIdx].claimedBy === null) {
        const card = G.players[ctx.currentPlayer].hand.splice(cardIdx, 1)[0];
        G.slots[slotIdx].cards[ctx.currentPlayer].push(card);
        ctx.events.endStage();
    }
}


// Claim any number of won circles 
function claimCircle (G: GameState, ctx: Ctx, circleIdx: number): void | typeof INVALID_MOVE {
    G.slots = G.slots.map(s => ({ ...s, score: scoreSlot(s, s.scoringFunc) }));

    if (checkGameEnd(G, ctx)){
        ctx.events.endGame();
    } else {
        ctx.events.endStage();
    }
}


// Draw a card from either the 'troops' or 'tactics' deck (if available)
const drawTroop = (G, ctx) => drawCard(G, ctx, 'troops')
const drawTactic = (G, ctx) => drawCard(G, ctx, 'tactics')

function drawCard (G: GameState, ctx: Ctx, deck: string): void | typeof INVALID_MOVE {
    if (G[deck].length > 0) {
        const card = G[deck].pop();
        G.players[ctx.currentPlayer].hand.push(card);
        ctx.events.endStage(); // for testing, should e endTurn normally
    } else {
        return INVALID_MOVE;
    }
}


// Determine if a player has won the game
// Game end is checked whenever a circle is claimed.
// Game ends immediately if a player has won 5 total or 3 adjacent circles
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

let scoreDefault: ScoringFunc;
let scoreRanks: ScoringFunc;

scoreDefault = function(stack) {

    let scr_formations: number = 0;
    let scr_ranks: number = sumRanks(stack);

    if (is_straight && is_flush) {
        scr_formations = 4;
    } else if (is_onekind) {
        scr_formations = 3;
    } else if (is_flush) {
        scr_formations = 2;
    } else if (is_straight) {
        scr_formations = 1;
    }
   
    return [scr_formations, scr_ranks];
}

scoreRanks = function(stack) {
    return [0, sumRanks(stack)];
}

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

// Sum of card ranks, used when no valid formation or as tie breaker
function sumRanks(stack: Stack): number {
    let value = stack.map(c => c.rank).reduce((acc, val) => acc + val, 0);
    return value;
}


export { playCard, claimCircle, drawTroop, drawTactic, pass }