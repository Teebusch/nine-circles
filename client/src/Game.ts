import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx, Game } from "boardgame.io";
import type { Stack } from './cards'
import { troops, tactics } from './cards'

export interface Slot {
    cards: [Stack, Stack];   // cards played into slot by each player
    maxCards: number;  // number of cards per side, may be modified by tactics 
    won: boolean;   // has the slot been won?
    winner: number | null;  // who won it?
    scoringFunc: string;  // name of scoring function in lieu of a reference, b/c G must be serialisable
}

export interface Player {
    hand: Stack;
}

export interface GameState {
    players: { '0': Player, '1': Player} ;
    slots: Array<Slot>;
    discarded: Stack;
    troops: Stack;
    tactics: Stack;
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

const slot: Slot = {
    cards: [ [], [] ],  
    maxCards: 3,      
    won: false,      
    winner: null,  
    scoringFunc: 'score_default'
}


function playCard (G, ctx, card_idx: number, slot_idx: number) {
    let card = G.players[ctx.currentPlayer].hand.splice(card_idx, 1)[0];
    console.log(card)
    G.slots[slot_idx].cards[ctx.currentPlayer].push(card);
}

function claimCircles (G, ctx, id) {
    //
}

function drawTroop (G, ctx){
    let card = G.troops.pop();
    console.log(card);
    G.players[ctx.currentPlayer].hand.push(card);
}

function drawTactic (G, ctx) {
    let card = G.tactics.pop();
    console.log(card);
    G.players[ctx.currentPlayer].hand.push(card);
}


export const NineCircles = {
    
    setup: function(ctx): GameState {

        let deck_troops = ctx.random.Shuffle(troops);
        let deck_tactics = ctx.random.Shuffle(tactics);

        return { 
            players: {
                '0': { hand: deck_troops.splice(0, 7) }, 
                '1': { hand: deck_troops.splice(0, 7) } 
            },
            slots: Array(9).fill({...slot}),
            troops: deck_troops,
            tactics: deck_tactics,
            discarded: []
        }
    },
      
    moves: {
        playCard: playCard,
        claimCircles: claimCircles,
        drawTroop: drawTroop,
        drawTactic: drawTactic
    },

    minPlayers: 2,
    maxPlayers: 2,

    endIf: (G, ctx) => {
        // Game ends immediately if a player has claimed 3 adjecent flags
        //  or 5 flags in total
        let score = {
            adjacent: [0, 0],
            total: [0, 0],
            winner: null
        };

        G.slots.forEach((s: Slot, idx: number) => {
            if (s.winner === 0) {
                score.total[0] += 1;
                score.adjacent[0] += 1;
                score.adjacent[1] = 0;
            } else if (s.winner === 1) {
                score.total[1] += 1;
                score.adjacent[1] += 1;
                score.adjacent[0] = 0;
            } else {
                score.adjacent = [0, 0];
            }
        })

        if (score.total[0] >= 5 || score.adjacent[0] >= 3) {
            score.winner = 0;
        } else if (score.total[1] >= 5 || score.adjacent[1] >= 3) {
            score.winner = 1;
        }

        if (score.winner) return score;
    }
};