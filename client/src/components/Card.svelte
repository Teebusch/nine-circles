<script lang="ts">
import type { Card } from "../cards";
import { fade } from 'svelte/transition';

const suits = ['♠', '❤', '✦', '✤', '✿', '✚'];

export let card: Card;
export let isSelected = false;
</script>

    {#if card.type == 'troop'}
    <div class="card {`suit-${card.suit}`} {card.value ? `value-${card.value}` : ''}" class:selected={isSelected} on:click transition:fade>
        <div class="card-image"></div>
        <div class="edge edge-top">
            <span class="edge-left"></span>
            <span class="edge-center">{card.value}</span>
            <span class="edge-right">{suits[card.suit-1]}</span>
        </div>
        <div class="card-text">
        </div>
        <div class="edge edge-bottom">
            <span class="edge-left"></span>
            <span class="edge-center">{card.value}</span>
            <span class="edge-right">{suits[card.suit-1]}</span>
        </div>
    </div>
    {:else if card.type == 'tactic'}
    <div class="card tactic { card.suit ? `suit-${card.suit}`: '' }" class:selected={isSelected} on:click transition:fade>
        <div class="card-image"></div>
        <div class="edge edge-top">
            <span class="edge-left"></span>
            <span class="edge-center">{ card.valueText ? card.valueText : '' }</span>
            <span class="edge-right"></span>
        </div>
        <div class="card-text">
            { card.text }
        </div>
        <div class="edge edge-bottom">
            <span class="edge-left"></span>
            <span class="edge-center">{ card.valueText ? card.valueText : '' }</span>
            <span class="edge-right"></span>
        </div>
    </div>
    {/if}


<style>


.card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: var(--card-w);
    height: var(--card-h);
    border-radius: var(--card-r);
    box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.4), 0 0 3em rgba(0, 0, 0, 0.2);
    background: rgb(180, 178, 178);
    text-align: center;
    color: rgb(255, 255, 255);
    line-height: normal;
    cursor: pointer;
    user-select: none;
}

.card.facedown {
    background: rgb(180, 178, 178);
}

.edge {
    border-top-left-radius: var(--card-r);
    border-top-right-radius: var(--card-r);
    display: flex;
    justify-content: space-around;
    text-align: center;
    justify-items: center;
    align-items: center;
    mix-blend-mode: hard-light;
    opacity: 0.9;
    padding: 0.2em 0.5em;
}

.edge-left, .edge-right {
    flex: 1 1 0;
}

.edge > .edge-center {
    font-size: min(2em, calc(var(--card-w) * .3));
    font-weight: bold;
}

.edge-bottom {
    transform: rotate(180deg);
}

.card-text {
    padding: 0 0.2em;
    color:rgb(30, 3, 36);
    mix-blend-mode: multiply;   
}

.card.suit-0 {
    background-color:var(--suit0-c);
}
.card.suit-1 {
    background-color:var(--suit1-c);
}
.card.suit-2 {
    background-color: var(--suit2-c);
}
.card.suit-3 {
    background-color: var(--suit3-c);
}
.card.suit-4 {
    background-color: var(--suit4-c);
}
.card.suit-5 {
    background-color: var(--suit5-c);
}
.card.suit-6 {
    background-color: var(--suit6-c);
}
.card.suit-wild {
    background-image: linear-gradient(to right bottom,
     var(--suit1-c), var(--suit2-c), var(--suit3-c), var(--suit4-c), var(--suit5-c), var(--suit6-c));
}

.card-image {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    background-repeat: no-repeat;
    background-size: 500% 200%;
    mix-blend-mode: overlay;
    background: url("/img/warriors.png");
    width: var(--card-w);
    height: var(--card-h);
    max-width: 200px;
    max-height: 200px;
    border-radius: var(--card-r);
}

.value-1 .card-image {
    background-position: 0 0;
}
.value-2 .card-image {
    background-position: 200px 0;
}
.value-3 .card-image {
    background-position: 400px 0;
}
.value-4 .card-image {
    background-position: 600px 0px;
}
.value-5 .card-image {
    background-position: 800px 0px;
}
.value-6 .card-image {
    background-position: 0px 200px;
}
.value-7 .card-image {
    background-position: 200px 200px;
}
.value-8 .card-image {
    background-position: 400px 200px;
}
.value-9 .card-image {
    background-position: 600px 200px;
}
.value-10 .card-image {
    background-position: 800px 200px;
}


.tactic .card-image {
    background-image: none;
}
</style>
