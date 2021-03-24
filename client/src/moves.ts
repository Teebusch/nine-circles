
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx } from 'boardgame.io';
import type { GameState } from './Game'
import type { Card, Stack } from './cards'

// Moves the active player can make. There is a fixed order: 
// (1) play a card, (2) claim circles, (3) draw a new card
// under sime circumstances the player can/must also pass
// Not all stages will always be possible

function pass (G: GameState, ctx: Ctx): void | string {
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

// Play a card from the hand onto one of the 9 circles 
// or -for certain tactics cards- use the card's effect.
function playCard (G: GameState, ctx: Ctx, cardId: string, circleId: number): void | typeof INVALID_MOVE {

    let hand = G.players[ctx.currentPlayer].hand;
    let card = hand.find((c) => c.id === cardId);
    let circle = G.circles.find((c) => c.id === circleId);
    
    if (card && circle && !circle.winner) {
        G.players[ctx.currentPlayer].hand = hand.filter((c) => c.id !== cardId);
        circle.cards[ctx.currentPlayer].push(card);
        ctx.events.endStage();        
    } else {
        return INVALID_MOVE
    }
}


// Claim any number of won circles 
function claimCircle (G: GameState, ctx: Ctx, circleId: number): void | typeof INVALID_MOVE {
    
    let circle = G.circles.find((c) => c.id === circleId);

    // ToDo...
    // G.circles = G.circles.map(s => ({ ...s, score: scoreSlot(s, s.scoringFunc) }));
    circle.winner = ctx.currentPlayer;

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
function checkGameEnd (G: GameState, ctx: Ctx): void | string  {
    let total = {};
    let adjacent = {};

    for (const crc of G.circles) {
        let p = crc.winner;

        if (p) {
            // update totals
            total[p] = total[p] + 1 || 1;

            // update adjacents
            if (adjacent[p]) {
                adjacent[p] = adjacent[p] + 1;
            } else {
                adjacent = {}
                adjacent[p] = 1;
            }

            // check victory
            if (adjacent[p] == 3 || total[p] == 5) {
                return p;
            }
        } else {
            adjacent = {};
        };
    };
}


// Scoring of circles

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