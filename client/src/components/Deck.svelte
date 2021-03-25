<script type="ts">

export let active = false;
export let deck = "Troops"
export let nCards = 0;


// make "blank" cards 

</script>

<div class="deck" class:empty={ nCards <= 0 } on:click>
    {#if nCards > 0}
    <div class="top-card" class:active={ active && nCards > 0 }>
        <span>{ deck }</span>
        <span>{ nCards }</span>
    </div>
    {/if}
</div>

<style>

    .deck {
        width: var(--card-w);
        height: var(--card-h);
        border-radius: var(--card-r);
        text-align: center;
        color: rgb(43, 43, 43);
    }

    .empty {
        background: none;
        box-shadow: none;
        border: 1px dashed rgb(72, 97, 91);
    }
    
    .top-card {
        width: var(--card-w);
        height: var(--card-h);
        border-radius: var(--card-r);
        position: relative;
        box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.4), 0 0 3em rgba(0, 0, 0, 0.2);
        background: rgb(0, 10, 10);
        color: rgb(138, 153, 149);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        user-select: none;
        line-height: normal;
        transition: transform 300ms ease-out;
    }

    .top-card.active {
        cursor: pointer;
        border: 1px solid rgb(160, 221, 207);
        box-shadow: rgba(126, 235, 220, 0.1) 0 0 0.5em;
        transition: filter 200ms ease;
    }

    .top-card.active:hover {
        filter: brightness(1.2);
        box-shadow: rgba(216, 216, 214, 0.2) 0 0 0.5em;
    }

</style>