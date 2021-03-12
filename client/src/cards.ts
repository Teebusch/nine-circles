export interface Card {
    type: "troop" | "tactic";
    suit?: number | 'wild'; // null is used as wildcard suit
    value?: number | Array<number>; // Array is used for tactics
    valueText?: string; // used for tactics
    text?: string | null;
    move?: string;  // name of function (special move) the card triggers
    tip?: string | null; // tooltip with extra explanations
}

export type Stack = Array<Card>;




function makeCards(suits: number, values: number): Stack {
    let stack: Stack = [];
    for (let s = 1; s <= suits; s++) {
        for (let v = 1; v <= 10; v++) {
            stack = [{ type: 'troop', suit: s, value: v }, ...stack];
        }
    }
    return stack
}

const troops: Stack = makeCards(6, 10);

const tactics: Stack = [
    { 
        type: 'tactic',
        text: 'Beelzebub',
        suit: 'wild',
        value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        valueText: '1-10',
        tip: 'Define color and value when circle is claimed. Each player can only play one leader per game.'
    },
    { 
        type: 'tactic',
        text: 'Mephisto',
        suit: 'wild',
        value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        valueText: '1-10',
        tip: 'Define color and value when circle is claimed. Each player can only play one leader per game.' 
    },
    { 
        type: 'tactic',
        text: 'Chimera',     
        suit: 'wild', 
        value: 8,
        valueText: '8',
        tip: 'Play as troop. Counts as an 8. Color is determined when circle is claimed.' 
    },
    { 
        type: 'tactic',
        text: '3-headed monkey', 
        suit: null,
        value: [1, 2, 3],
        valueText: '1-3',
        tip: 'Play as troop. Determine if 1,2,3 and which color when circle is claimed.'
    },
    { 
        type: 'tactic',
        text: 'Mano a Mano',
        move: '',
        tip: 'Modify a flag, so that formations do not count, only value.'
    },
    { 
        type: 'tactic',
        text: 'Hell frozen over',
        move: '',
        tip: 'Modify a flag, so that four cards are needed to claim it. Formations are expanded accordingly.' 
    },
    { 
        type: 'tactic',
        text: 'Reeducation program', 
        tip: 'Draw three cards, put 2 cards from your hand facedown on top of their decks.' 
    },
    { 
        type: 'tactic',
        text: 'Detour',
        move: '',
        tip: 'Move a troop or tactics card on your own side into a different spot or discard it.' 
    },
    { 
        type: 'tactic',
        text: 'Unfortunate accident', 
        move: '',
        tip: 'Take any card from an unclaimed circle on the opponents side and discard it.' 
    },
    { 
        type: 'tactic',
        text: 'We have cookies!',
        move: '',
        tip: 'Take a troop card from an unclaimed circle on the opponents side and put it into an empty slot on your own side' 
    }
];

export { troops, tactics }