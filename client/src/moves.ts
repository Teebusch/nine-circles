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
    //ctx.events.endTurn();
    ctx.events.setStage("playCard");
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
  // update scores and determine if there is a winner of all unclaimed circles
  // where one side has played maxCards
  let circles = G.circles.filter((crc) => {
    return (
      !crc.claimedBy &&
      Object.values(crc.cards).some((e) => e.length === crc.maxCards)
    );
  });

  if (circles.length > 0) {
    // cards that might still be added
    // const unplayedTroops = Object.values(G.players)
    //   .map((e) => e.hand)
    //   .reduce((a, b) => a.concat(b))
    //   .filter((e) => e.type == "troop")
    //   .concat(G.troops);

    circles.forEach((crc) => {
      // update scores on both sides
      Object.entries(crc.cards).forEach(([pId, cards]) => {
        // Use default scoring or was scoring modified by tactics card?
        // (there's only one 'non-default' scoring: counting only ranks)
        crc.scores[pId] = !crc.scoringFunc ? scoreFormation(cards) : scoreRanks(cards);
        console.log(crc.scores[pId])
      });

      const maxScore = Math.max(...Object.values(crc.scores));

      // Is a player winning the circle?
      Object.entries(crc.cards).forEach(([pId, cards]) => {
        if (cards.length == crc.maxCards && crc.scores[pId] === maxScore) {
          crc.winner = pId;
        }
      });
    });
  }
}

// Score formations
// deals with wildcards (they have arrays as ranks / suit)
function scoreFormation(cards: Stack): number {

  // Straight - consecutive numbers
  function isStraight(troops, wilds): boolean {
    if (wilds.length === 0) {
      return troops
        .sort((a, b) => a.rank - b.rank)
        .every((e, i) => {
          return i === troops.length - 1 || e.rank === troops[i + 1].rank - 1;
        });
    } else if (troops.length === 0) {
      // Players can only play 3 wildcards, with ranks [1,2,3], [8], and [1-10]
      // It is impossible to get a straight with just those cards
      return false;
    } else {
      // Both, troops and wildcards.
      let usedRanks = Array(10).fill(false);
      let nCards = wilds.length + troops.length; 
      let nNeeded = nCards; // consecutive numbers needed

      const troopRanks = troops.map(e => e.rank);
      for (const r of troopRanks) {
        if (usedRanks[r-1] === false) {
          usedRanks[r-1] = true;
        } else {
          return false; // abort, no duplicate ranks
        }
      };
      
      let wildRanks = wilds.map(e => e.rank); 
      for(const wr of wildRanks) {
        if (wr.length === 10) {
          // [1-10] - counts as any rank
          nNeeded -= 1;
        } else {
          // [8], // [1,2,3]
          // try larger ranks first, because it gives more points in the sum score
          for (let i = wr.length; i >= 0; i--) {
            const r = wr[i]
            if (usedRanks[r-1] === false) {
              usedRanks[r-1] = true;
              break;
            }
          }
          return false;  // all wild ranks were already used by regular troops
        }
      }
      
      let i = Math.min(usedRanks.findIndex(e => e), 9 - nCards);
      for (i; i >= 0; i--) {
        const j = i + nCards;
        const n = usedRanks.slice(i, j).reduce((a,b) => a + b)
        if (n === nNeeded) {
          return true;
        }
      }

      return false;
    }
  }

  // Flush - same suit
  // all wildcards have ALL suits (1-6), thus no need to search.
  function isFlush(troops, wilds): boolean {
    if (troops.length === 0 && wilds.length > 0) {
      return true;
    } else {
      const suit: number = troops[0].suit;
      return troops.every((e) => e.suit === suit);
    }
  }

  // One of a kind - same rank
  function isOneKind(troops, wilds): boolean {
    if (troops.length === 0 && wilds.length > 0) {
      // [10, 8, 3] are the best ranks that different wildcards may have in common (or none)
      const commonRank = [10, 8, 3].find((r) =>
        wilds.every((e) => e.rank.find((e) => e === r))
      );
      return commonRank ? true : false;
    } else {
      const rank: number = troops[0].rank;
      return (
        troops.every((e) => e.rank === rank) &&
        wilds.every((e) => e.rank.find((e) => e === rank)) // true if `wilds` is empty
      ); 
    }
  }

  if (cards.length === 0) {
    return 0;
  } else {
    // ToDo: Double check that all cards are either troops or wildcards
    let troops = [];
    let wilds = [];
    cards.forEach((e) => {
      (Array.isArray(e.rank) || Array.isArray(e.suit) ? wilds : troops).push(e);
    });

    const straight = isStraight(troops, wilds);
    const flush = isFlush(troops, wilds);

    let score: number;
    if (straight && flush) {
      score = 400;
    } else if (isOneKind(troops, wilds)) {
      score = 300;
    } else if (flush) {
      score = 200;
    } else if (straight) {
      score = 100;
    } else {
      score = 0;
    }

    // to do: if formation, score ranks wildcards' "final forms"
    // ToDO: score ranks if there are only wildcards.
    return score + scoreRanks(cards);
  }
}

// Sum of card ranks, used when no valid formation or as tie breaker
function scoreRanks(cards: Stack): number {
  // When there's a wildcard use the max
  const maxRanks = cards.map((e) => {
    let rank = e.rank;
    return Array.isArray(rank) ? Math.max(...rank) : rank;
  });
  return maxRanks.reduce((a, b) => a + b, 0);
}

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
