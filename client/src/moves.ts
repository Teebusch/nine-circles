import { INVALID_MOVE } from "boardgame.io/core";
import type { Ctx } from "boardgame.io";
import type { Circle, GameState } from "./Game";
import type { Card, Stack } from "./cards";

// For each players hand, determine which cards are playable
export function updatePlayable(G: GameState, ctx: Ctx): void {
  function isPlayable(card: Card, pId: string): boolean {
    let oppId = pId == "0" ? "1" : "0";

    if (card.type == "tactic") {
      if (G.players[pId].nPlayedTactics > G.players[oppId].nPlayedTactics) {
        return false;
      }
      if (card.move == "placeLeader" && G.players[pId].playedLeader) {
        return false;
      }
      // ToDo: implement other tactics
      if (!["placeCard", "placeLeader"].find((e) => e == card.move)) {
        return false;
      }
    }
    return true;
  }

  for (const [pId, plr] of Object.entries(G.players)) {
    let hand = plr.hand;
    let playable = {};
    hand.forEach((crc) => (playable[crc.id] = isPlayable(crc, pId)));
    G.players[pId].playable = playable;
  }
}

// Moves the active player can make. There is a fixed order:
// (1) play a card
// (2) claim circles
// (3) draw a new card
// Not all stages will always be possible
// under some circumstances the player can/must also (4) pass

// Play a card from the hand
export function playCard(
  G: GameState,
  ctx: Ctx,
  cardId: string,
  circleId: number
): void | typeof INVALID_MOVE {
  let pId = ctx.currentPlayer;
  let plr = G.players[pId];
  let card = plr.hand.find((e) => e.id === cardId);
  let playable = plr.playable[cardId];

  if (!playable) {
    return INVALID_MOVE;
  }

  const move = card.move || "placeCard";
  switch (move) {
    // place card from hand in a circle on players own side
    case "placeCard":
      if (placeCard(G, ctx, card, circleId) == INVALID_MOVE) {
        return INVALID_MOVE;
      }
      break;

    // place a leader card from hand in cirle on own side (max. one per game)
    case "placeLeader":
      if (placeCard(G, ctx, card, circleId) == INVALID_MOVE) {
        return INVALID_MOVE;
      } else {
        plr.playedLeader = true;
      }
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

  // after playing card update circle scores and end Stage
  scoreCircles(G, ctx);
  ctx.events.endStage();
}

// Card effect: Place card from players hand in a circle on players own side
const placeCard = (G, ctx, card, circleId) => {
  let pId = ctx.currentPlayer;
  let hand = G.players[pId].hand;
  let circle = G.circles.find((e) => e.id === circleId);

  if (
    !circle ||
    circle.claimedBy ||
    circle.cards[pId].length == circle.maxCards
  ) {
    return INVALID_MOVE;
  }

  G.players[pId].hand = hand.filter((e) => e.id !== card.id);
  circle.cards[pId].push(card);

  if (card.type == "tactic") {
    G.players[pId].nPlayedTactics += 1;
  }
};

// Claim any number of won circles
export function claimCircle(
  G: GameState,
  ctx: Ctx,
  circleId: number
): void | typeof INVALID_MOVE {
  let crc: Circle = G.circles.find((e) => e.id === circleId);

  if (crc.winner === ctx.currentPlayer) {
    crc.claimedBy = ctx.currentPlayer;
    crc.winner = null;
  } else {
    return INVALID_MOVE;
  }

  if (checkGameEnd(G, ctx)) {
    ctx.events.endGame();
  } else {
    ctx.events.endStage();
  }
}

// Draw a card from either the 'troops' or 'tactics' deck (if available)
export const drawTroop = (G, ctx) => drawCard(G, ctx, "troops");
export const drawTactic = (G, ctx) => drawCard(G, ctx, "tactics");

function drawCard(
  G: GameState,
  ctx: Ctx,
  deck: string
): void | typeof INVALID_MOVE {
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
export function pass(G: GameState, ctx: Ctx): void | typeof INVALID_MOVE {
  const stage = ctx.activePlayers[ctx.currentPlayer];

  switch (stage) {
    // If hand is empty or contains only unplayable cards player may pass
    case "playCard":
      const playable = Object.values(G.players[ctx.currentPlayer].playable);
      if (playable.length === 0 || playable.every((e) => !e)) {
        ctx.events.endStage();
        break;
      } else {
        return INVALID_MOVE;
      }

    // Player may always pass on claiming circles
    case "claimCircles":
      ctx.events.endStage();
      break;

    // If there are no cards left to draw, player may pass on drawing cards
    case "drawCard":
      if (G.tactics.length == 0 && G.troops.length == 0) {
        ctx.events.endTurn();
        break;
      } else {
        return INVALID_MOVE;
      }

    default:
      return INVALID_MOVE;
  }
}

// Scoring of circles

// update scores of all circles and decide if a player is winning a circle
// A player wins the circle (and can claim it) if (1) maxCards cards played,
// and (2) score higher than highest possible score that opponent can still
// possibly get.
// Opponents potential max score is based on information that is openly
// available on the board and not counting tactic cards, that is, the highest
// scoring combination with troop cards in troop deck and in player hands.
// As long as the circle is unclaimed, the winner could still change due to
// tactics cards being played
function scoreCircles(G: GameState, ctx: Ctx): void {
  // iterate over all unclaimed circles where one side has played maxCards,
  // update scores and determine if there is a winner
  let circles = G.circles.filter((crc) => {
    return (
      !crc.claimedBy &&
      Object.values(crc.cards).some((e) => e.length === crc.maxCards)
    );
  });

  if (circles.length > 0) {
    const unplayedTroops = Object.values(G.players)
      .map((e) => e.hand)
      .reduce((a, b) => a.concat(b))
      .filter((e) => e.type == "troop")
      .concat(G.troops);

    circles.forEach((crc) => {
      // score cards on both sides
      Object.entries(crc.cards).forEach(([pId, cards]) => {
        // if player has played maxCards cards test if they can claim circle
        if (cards.length == crc.maxCards) {
          crc.scores[pId] = scoreRanks(cards); // for testing
        } else {
          // ToDo: find best...
          crc.scores[pId] = scoreRanks(cards); // for testing
        }
      });

      const maxScore = Math.max(...Object.values(crc.scores));

      // Is a player winning the cirle?
      Object.entries(crc.cards).forEach(([pId, cards]) => {
        if (cards.length == crc.maxCards && crc.scores[pId] === maxScore) {
          crc.winner = pId;
        }
      });
    });
  }
}

// Sum of card ranks, used when no valid formation or as tie breaker
function scoreRanks(cards: Stack): number {
  const bestRanks = cards.map((e) => {
    let rank = e.rank;
    return Array.isArray(rank) ? Math.max(...rank) : rank;
  });

  return bestRanks.reduce((a, b) => a + b, 0);
}

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

// Determine if a player has won the game. Checked whenever a circle is claimed.
// Game ends immediately if a player has won 5 total or 3 adjacent circles
// Even if winner is found early, iterate through all circles to get the
// total number of circles claimed by each player (used for scoring in multi-round games)
function checkGameEnd(G: GameState, ctx: Ctx): void | {} {
  let scores = {
    total: {},
    maxAdjacent: {},
    winner: null,
  };

  let adjacent = {}; // temporary object to keep track of number of adjacent circles

  for (const crc of G.circles) {
    let pId = crc.claimedBy;

    if (pId) {
      // update totals
      scores.total[pId] = scores.total[pId] + 1 || 1;

      // update adjacents
      if (adjacent[pId]) {
        adjacent[pId] = adjacent[pId] + 1;
      } else {
        adjacent = {};
        adjacent[pId] = 1;
      }
      scores.maxAdjacent[pId] = Math.max(
        adjacent[pId],
        scores.maxAdjacent[pId] || 0
      );
    } else {
      // reset adjacent counter
      adjacent = {};
    }
  }

  // check victory (there will always be only 1 player who reaches the winning condition
  // on a given turn)
  Object.entries(scores.total).forEach(([id, s]) => {
    if (s >= 5) scores.winner = id;
    console.log(id, s, scores.winner);
  });

  Object.entries(scores.maxAdjacent).forEach(([id, s]) => {
    if (s >= 3) scores.winner = id;
    console.log(id, s, scores.winner);
  });

  if (scores.winner) {
    return scores;
  }
}
