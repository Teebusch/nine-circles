export interface Card {
    readonly id: string;
    readonly type: "troop" | "tactic";
    readonly suit?: number | Array<number>; // Array is used for tactics with wildcard suit
    readonly rank?: number | Array<number>; // Array is used for tactics
    readonly rankText?: string; // used for tactics
    readonly text?: string | null;
    readonly move?: string;  // name of function (special move) the card triggers
    readonly tip?: string | null; // tooltip with extra explanations
}

export type Stack = Array<Card>;


function makeCards(suits: number, ranks: number): Stack {
    let stack: Stack = [];
    for (let s = 1; s <= suits; s++) {
        for (let r = 1; r <= 10; r++) {
            stack = [{ id: `${s}${r}`, type: 'troop', suit: s, rank: r }, ...stack];
        }
    }
    return stack
}

const Troops: Stack = makeCards(6, 10);

const Tactics: Stack = [
    { 
        id: 'T0',
        type: 'tactic',
        text: 'Beelzebub',
        suit: [1, 2, 3, 4, 5, 6],
        rank: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        rankText: '1-10',
        tip: 'Define color and value when circle is claimed. Each player can only play one leader per game.'
    },
    { 
        id: 'T1',
        type: 'tactic',
        text: 'Mephisto',
        suit: [1, 2, 3, 4, 5, 6],
        rank: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        rankText: '1-10',
        tip: 'Define color and value when circle is claimed. Each player can only play one leader per game.' 
    },
    { 
        id: 'T2',
        type: 'tactic',
        text: 'Chimera',     
        suit: [1, 2, 3, 4, 5, 6], 
        rank: 8,
        rankText: '8',
        tip: 'Play as troop. Counts as an 8. Color is determined when circle is claimed.' 
    },
    { 
        id: 'T3',
        type: 'tactic',
        text: '3-headed monkey', 
        suit: [1, 2, 3, 4, 5, 6],
        rank: [1, 2, 3],
        rankText: '1-3',
        tip: 'Play as troop. Determine if 1,2,3 and which color when circle is claimed.'
    },
    { 
        id: 'T4',
        type: 'tactic',
        text: 'Mano a Mano',
        move: '',
        tip: 'Modify a flag, so that formations do not count, only value.'
    },
    { 
        id: 'T5',
        type: 'tactic',
        text: 'Hell frozen over',
        move: '',
        tip: 'Modify a flag, so that four cards are needed to claim it. Formations need to be expanded accordingly.' 
    },
    { 
        id: 'T6',
        type: 'tactic',
        text: 'Reeducation program', 
        tip: 'Draw three cards, put 2 cards from your hand facedown on top of their decks.' 
    },
    { 
        id: 'T7',
        type: 'tactic',
        text: 'Detour',
        move: '',
        tip: 'Move a troop or tactics card on your own side into a different spot or discard it.' 
    },
    { 
        id: 'T8',
        type: 'tactic',
        text: 'Unfortunate accident', 
        move: '',
        tip: 'Take any card from an unclaimed circle on the opponents side and discard it.' 
    },
    { 
        id: 'T9',
        type: 'tactic',
        text: 'We have cookies!',
        move: '',
        tip: 'Take a troop card from an unclaimed circle on the opponents side and put it into an empty slot on your own side' 
    }
];

export { Card, Stack, Troops, Tactics }