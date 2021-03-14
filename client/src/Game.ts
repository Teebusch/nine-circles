
import type { Ctx } from "boardgame.io";
import type { Stack } from './cards'
import { troops, tactics } from './cards'
import { playCard, claimCircles, drawTroop, drawTactic } from './moves'

export interface Player {
    hand: Stack
}
export interface Slot {
    cards: [Stack, Stack];    // cards played into slot by each player
    maxCards: number;         // number of cards per side, may be modified by tactics 
    claimedBy: null | 0 | 1;  // has the slot been won? If not null, If won, winner's id.
    scoringFunc: string;      // name of scoring function, can be modified by tactics
}
export interface GameState {
    players: { [key: string]: Player } ;
    slots: Slot[];
    discarded: Stack;
    troops: Stack;
    tactics: Stack;
}

function setup (ctx: Ctx): GameState {
    let deck_troops = ctx.random.Shuffle(troops);
    let deck_tactics = ctx.random.Shuffle(tactics);

    const slot: Slot = {
        cards: [ [], [] ],  
        maxCards: 3,          
        claimedBy: null,  
        scoringFunc: 'default'
    }

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
}

export const NineCircles = {
    setup: setup,
    
    turn: {
        onBegin: (G, ctx) => {
            ctx.events.setStage('playCard')
        },

        stages: {
            playCard: {
                moves: { playCard },
                next: 'claimCircles',
            },
            claimCircles: {
                moves: { claimCircles },
                next: 'drawCard'
            },
            drawCard: {
                moves: { 
                    drawTactic: { move: drawTactic, undoable: false },
                    drawTroop: { move: drawTroop, undoable: false }
                }
            }
        }
    },

    minPlayers: 2,
    maxPlayers: 2
};