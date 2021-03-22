<script type="ts">

export let deck = "Troops"
export let numCards = 0;


// make "blank" cards 

</script>

<div class="deck" class:empty={ numCards <= 0 } on:click>
    <div class="card">
        <span>{ deck }</span>
        <span>{ numCards }</span>
    </div>
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
        color: rgb(72, 97, 91);
        border: 1px dashed rgb(72, 97, 91);
    }
    
    .card {
        width: var(--card-w);
        height: var(--card-h);
        border-radius: var(--card-r);
        position: relative;
        box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.4), 0 0 3em rgba(0, 0, 0, 0.2);
        background: rgb(180, 178, 178);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        cursor: pointer;
        user-select: none;
        line-height: normal;
        transition: transform 300ms ease-out;
    }

    .card:hover {
        box-shadow: 0 1em 1em rgba(0, 0, 0, 0.3);
        transform: scale(1.1);
    }

    .card:active {
        transform: scale(1.4);
    }

</style>