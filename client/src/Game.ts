
import type { Ctx } from "boardgame.io";
import type { Stack } from './cards'
import { Troops, Tactics } from './cards'
import { playCard, claimCircle, drawTroop, drawTactic, pass } from './moves'

export interface GameState {
    players: { [key: string]: Player } ;
    circles: Circle[];
    discarded: Stack;
    troops: Stack;
    tactics: Stack;
}

export interface Player {
    hand: Stack;
    nPlayedTactics: number;
    nPlayedLeaders: number;
    mayPass: boolean;
}

export interface Circle {
    id: number;
    cards: [Stack, Stack];    // cards played into slot by each player
    maxCards: number;         // number of cards per side, may be modified by tactics 
    winner: null | string;  // has the slot been won? If not null, If won, winner's id.
    available: boolean;
    scoringFunc?: string;      // name of scoring function, can be modified by tactics
}


function setup (ctx: Ctx): GameState {
    let troops = ctx.random.Shuffle(Troops);
    let tactics = ctx.random.Shuffle(Tactics);

    return { 
        players: {
            '0': { 
                hand: troops.splice(0, 7),
                nPlayedTactics: 0,
                nPlayedLeaders: 0,
                mayPass: false
            }, 
            '1': { 
                hand: troops.splice(0, 7),
                nPlayedTactics: 0,
                nPlayedLeaders: 0,
                mayPass: false
            } 
        },
        circles: Array(9).fill(null).map((_, i): Circle => (
            { 
                id: i, 
                cards: [ [], [] ], 
                maxCards: 3, 
                winner: null, 
                available: true 
            }
        )),
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
                    drawTroop: { move: drawTroop, undoable: false},
                    pass: { move: pass }
                },
                next: 'playCard'
            }
        }
    },

    minPlayers: 2,
    maxPlayers: 2
};