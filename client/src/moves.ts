
import { INVALID_MOVE } from 'boardgame.io/core';
import type { Ctx } from 'boardgame.io';
import type { Circle, GameState } from './Game'
import type { Card, Stack } from './cards'


// function updateMayPass (G: GameState, ctx: Ctx): void {
//     const stage = ctx.activePlayers[ctx.currentPlayer];

//     switch (stage) {
//         case 'playCard':
//             // If there are no cards in hand, or only unplayable cards 
//             // in hand, the player may pass playCard stage.
//             if (true) {
//                 G.players[ctx.currentPlayer].mayPass = true;
//                 break;
//             }
//         case 'claimCircles':
//             // If there are no cicrles to be claimed, or they don't want
//             // to claim any claimable circles, player may pass.
//             if (true) {
//                 ctx.events.endStage();  
//                 break;
//             } else {
                
//             }
//             case 'drawCard':
//             // If there are no cards left to draw, player may pass.
//             //if (G.tactics.length == 0 && G.troops.length == 0) {
//             if (true) {
//                 ctx.events.endTurn();
//                 break; 
//             } else {
                
//             }
//         default:   
//     } 
// }


function updatePlayable(G: GameState, ctx: Ctx): void {

    function isPlayable (card: Card, pId: string): boolean {   
        let oppId = pId == '0' ? '1' : '0';

        if (card.type == 'tactic') {
            if (G.players[pId].nPlayedTactics > G.players[oppId].nPlayedTactics) {
                return false;
            } 
            if (card.move == 'placeLeader' && G.players[pId].playedLeader) {
                return false
            }
            // ToDo: implement other tactics
            if (!(['placeCard', 'placeLeader'].find((e) => e == card.move))) {
                return false;
            }
        }
        return true;
    }

    for (const [pId, plr] of Object.entries(G.players)) {
        let hand = plr.hand;
        let playable = {};
        hand.forEach((crc) => playable[crc.id] = isPlayable(crc, pId));
        G.players[pId].playable = playable;
    }

}



// Moves the active player can make. There is a fixed order: 
// (1) play a card, (2) claim circles, (3) draw a new card
// Not all stages will always be possible
// under some circumstances the player can/must also (4) pass


// Play a card from the hand
function playCard (G: GameState, ctx: Ctx, cardId: string, circleId: number): void | typeof INVALID_MOVE {
    let pId = ctx.currentPlayer;
    let plr = G.players[pId];
    let card = plr.hand.find((e) => e.id === cardId);
    let playable = plr.playable[cardId];

    if (!playable) {
        return INVALID_MOVE;
    } 

    const move = card.move || 'placeCard';
    switch (move){
        // place card from hand in a circle on players own side
        case "placeCard": 
            if (placeCard(G, ctx, card, circleId) == INVALID_MOVE) {
                return INVALID_MOVE;
            };
            break;

        // place a leader card from hand in cirle on own side (max. one per game)
        case "placeLeader": 
            if(placeCard(G, ctx, card, circleId) == INVALID_MOVE){
                return INVALID_MOVE
            } else {
                plr.playedLeader = true;
            };
            break;
        
        // modify a circle scoring functions so that all formations score the same 
        case "modifyScoring":  
            //...
            return INVALID_MOVE;
            break;

        // modify a circle so that it needs 4 cards to claim it / complete a formation
        case "modifyMaxCards": 
            //... 
            return INVALID_MOVE;
            break;  

        // draw three cards, put 2 back on top of piles
        case "drawThenReplace": 
            //... 
            return INVALID_MOVE;
            break;

        // move card from own circle to a different spot
        case "moveOwnCard": 
            //... 
            return INVALID_MOVE;
            break;

        // discard card from unclaimed circle on opponent's side
        case "discardOpponentCard": 
            //... 
            return INVALID_MOVE;
            break;

        // take card from unclaimed circle on opponent side, move to own unclaimed circle
        case "stealOpponentCard": 
            //...  
            return INVALID_MOVE;
            break; 

        default:
            return INVALID_MOVE;  
    }
    
    // scoreCircles(G, ctx);

    // may always pass on claiming circles
    plr.mayPass = true;
    ctx.events.endStage();
}

// Card effect: Place card from players hand in a circle on players own side
const placeCard = (G, ctx, card, circleId) => {
    let pId = ctx.currentPlayer;
    let hand = G.players[pId].hand;
    let circle = G.circles.find((e) => e.id === circleId);

    if(!circle || circle.winner) {
        return INVALID_MOVE
    }
    
    G.players[pId].hand = hand.filter((e) => e.id !== card.id);
    circle.cards[pId].push(card);
    
    if (card.type == 'tactic') {
        G.players[pId].nPlayedTactics += 1;
    }
}



// Claim any number of won circles 
function claimCircle (G: GameState, ctx: Ctx, circleId: number): void | typeof INVALID_MOVE {
    
    let crc: Circle = G.circles.find((e) => e.id === circleId);

    if (crc.claimable[ctx.currentPlayer]) {
        crc.winner = ctx.currentPlayer;
        crc.claimable = [false, false];
    } else {
        return INVALID_MOVE;
    }

    if (checkGameEnd(G, ctx)){
        ctx.events.endGame();
    } else {
        ctx.events.endStage();
    }
}

// Determine if a player has won the game
// Checked whenever a circle is claimed.
// Game ends immediately if a player has won 5 total or 3 adjacent circles
function checkGameEnd (G: GameState, ctx: Ctx): void | string  {
    let total = {};
    let adjacent = {};

    for (const crc of G.circles) {
        let pId = crc.winner;

        if (pId) {
            // update totals
            total[pId] = total[pId] + 1 || 1;

            // update adjacents
            if (adjacent[pId]) {
                adjacent[pId] = adjacent[pId] + 1;
            } else {
                adjacent = {}
                adjacent[pId] = 1;
            }

            // check victory
            if (adjacent[pId] == 3 || total[pId] == 5) {
                return pId;
            }
        } else {
            adjacent = {};
        };
    };
}



// Draw a card from either the 'troops' or 'tactics' deck (if available)
const drawTroop = (G, ctx) => drawCard(G, ctx, 'troops')
const drawTactic = (G, ctx) => drawCard(G, ctx, 'tactics')

function drawCard (G: GameState, ctx: Ctx, deck: string): void | typeof INVALID_MOVE {
    if (G[deck].length > 0) {
        const card = G[deck].pop();
        G.players[ctx.currentPlayer].hand.push(card);
        updatePlayable(G, ctx);
        ctx.events.endTurn();
    } else {
        return INVALID_MOVE;
    }
}



// Pass (skip current stage)
function pass (G: GameState, ctx: Ctx): void | typeof INVALID_MOVE {
    if (G.players[ctx.currentPlayer].mayPass) {
        if (ctx.activePlayers[ctx.currentPlayer] == 'drawCard') {
            ctx.events.endTurn();
        } else {
            ctx.events.endStage();
        }
    } else {
        return INVALID_MOVE;
    }
}


// Scoring of circles

// update scores of all circles, determine if any of them are claimable
function scoreCircles(G: GameState, ctx: Ctx): void {
    
    // Can the circle be claimed by either player?
    for (let crc in G.circles) {
        if (!crc.winner) {
            
            // update circle max possible score for each player
            // ToDo...


        } 
            crc.cards[ctx.currentPlayer].length === crc.maxCards &&
            crc.maxScore[pId] >= crc.maxScore[pOpp]) {

            }
        }
    }
} 

interface ScoringFunc {
    (stack: Stack): [4 | 3 | 2 | 1 | 0, number];
}

// let scoreDefault: ScoringFunc;
// let scoreRanks: ScoringFunc;

// scoreDefault = function(stack) {

//     let scr_formations: number = 0;
//     let scr_ranks: number = sumRanks(stack);

//     if (is_straight && is_flush) {
//         scr_formations = 4;
//     } else if (is_onekind) {
//         scr_formations = 3;
//     } else if (is_flush) {
//         scr_formations = 2;
//     } else if (is_straight) {
//         scr_formations = 1;
//     }
   
//     return [scr_formations, scr_ranks];
// }

// scoreRanks = function(stack) {
//     return [0, sumRanks(stack)];
// }

// // Straight (consecutive numbers)
// function is_straight(stack: Stack): boolean {
//     //stack.sort((a,b) => a.value - b.value); 
//     return false;
// }

// // Flush (same color)
// function is_flush(stack: Stack): boolean {
//     // stack.every(e => e.suit === stack[0].suit);
//     return false;
// }

// // N of a kind (same number)
// function is_onekind(stack: Stack): Boolean {
//     // stack.every(e => e.value === stack[0].value);  
//     return false;
// }

// // Sum of card ranks, used when no valid formation or as tie breaker
// function sumRanks(stack: Stack): number {
//     let value = stack.map(c => c.rank).reduce((acc, val) => acc + val, 0);
//     return value;
// }



export { playCard, claimCircle, drawTroop, drawTactic, pass, updatePlayable }