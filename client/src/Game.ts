
import type { Ctx } from "boardgame.io";
import type { Stack } from './cards'
import { Troops, Tactics } from './cards'
import { playCard, claimCircle, drawTroop, drawTactic, updatePlayable, pass } from './moves'

export interface GameState {
    players: { [key: string]: Player };
    circles: Circle[];
    troops: Stack;
    tactics: Stack;
    discarded: Stack;
}

export interface Player {
    hand: Stack;
    playable: { [key: string]: boolean },
    nPlayedTactics: number;
    playedLeader: boolean;
}

export interface Circle {
    id: number;
    cards: { [key: string]: Stack };    // cards played into slot by each player
    maxScore: { [key: string]: number }
    claimable: { [key: string]: boolean }
    maxCards: number;         // number of cards per side, may be modified by tactics 
    winner: null | string;    // has the slot been won? If not null, If won, winner's id.
    scoringFunc?: string;     // name of scoring function, can be modified by tactics
}


function setup (ctx: Ctx): GameState {
    let troops = ctx.random.Shuffle(Troops);
    let tactics = ctx.random.Shuffle(Tactics);

    return { 
        players: {
            '0': { 
                hand: troops.splice(0, 7),
                playable: {},
                nPlayedTactics: 0,
                playedLeader: false,
            }, 
            '1': { 
                hand: troops.splice(0, 7),
                playable: {},
                nPlayedTactics: 0,
                playedLeader: false,
            } 
        },
        circles: Array(9).fill(null).map((_, i): Circle => (
            { 
                id: i, 
                cards: { '0': [], '1': [] }, 
                maxScore: { '0': undefined, '1': undefined }, 
                claimable: { '0': false, '1': false }, 
                winner: null, 
                maxCards: 3
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

        onBegin: (G, ctx) => {
            updatePlayable(G, ctx)
        },

        // determine whether player can skip the current stage, 
        // e.g. b/c there are no cards to play
        // onMove: (G, ctx) => updateMayPass(G, ctx),

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
                }
            }
        }
    },

    minPlayers: 2,
    maxPlayers: 2
};