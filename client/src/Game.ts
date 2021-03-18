
import type { Ctx } from "boardgame.io";
import type { Stack } from './cards'
import { Troops, Tactics } from './cards'
import { startTurn, playCard, claimCircle, drawTroop, drawTactic, pass } from './moves'

export interface Player {
    hand: Stack;
    nPlayedTactics: number;
    nPlayedLeaders: number;
}
export interface Slot {
    cards: [Stack, Stack];    // cards played into slot by each player
    maxCards: number;         // number of cards per side, may be modified by tactics 
    claimedBy: null | 0 | 1;  // has the slot been won? If not null, If won, winner's id.
    scoringFunc?: string;      // name of scoring function, can be modified by tactics
}
export interface GameState {
    players: { [key: string]: Player } ;
    slots: Slot[];
    discarded: Stack;
    troops: Stack;
    tactics: Stack;
}

function setup (ctx: Ctx): GameState {
    let troops = ctx.random.Shuffle(Troops);
    let tactics = ctx.random.Shuffle(Tactics);

    const slot: Slot = {
        cards: [ [], [] ],  
        maxCards: 3,          
        claimedBy: null
    }

    return { 
        players: {
            '0': { 
                hand: troops.splice(0, 7),
                nPlayedTactics: 0,
                nPlayedLeaders: 0
            }, 
            '1': { 
                hand: troops.splice(0, 7),
                nPlayedTactics: 0,
                nPlayedLeaders: 0
            } 
        },
        slots: Array(9).fill({...slot}),
        troops: troops,
        tactics: tactics,
        discarded: []
    }
}

export const NineCircles = {
    setup: setup,
    
    turn: {
        activePlayers: { 
            currentPlayer: 'playCard' 
        },

        stages: {
            playCard: {
                moves: { playCard, pass },
                next: 'claimCircles',
            },
            claimCircles: {
                moves: { claimCircle, pass },
                next: 'drawCard'
            },
            drawCard: {
                moves: { 
                    drawTactic: { move: drawTactic, undoable: false },
                    drawTroop: { move: drawTroop, undoable: false },
                    pass: { move: pass }
                }
            }
        }
    },

    minPlayers: 2,
    maxPlayers: 2
};