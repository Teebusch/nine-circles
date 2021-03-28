<script lang="ts">

export let message;
export let mayPass = false;

let text = ''; 
let passtext

$: {
    switch (message) {
        case 'gameOver':
            text = 'Game over!'
            break;

        case 'playCard':
            text = `You must play a card from your hand${mayPass ? " or pass.": "."}`;
            break;

        case 'claimCircles':
            text = 'You may claim one or more circles or pass.';
            break;

        case 'drawCard':
            text = `You must draw a card${mayPass ? " or pass.": "."}`;
            break;

        default:
            text = 'Waiting for your opponent to finish their move.'
            break;
    }
};


</script>

<div class="message">
    <div>{ @html text }</div>
    {#if mayPass}
        <button on:click>Pass</button>
    {/if}
</div>

<style>
.message {
    grid-area: message;
    align-self: end;
    color:rgb(224, 224, 224);
    text-align: center;
    cursor: default;
    user-select: none;
    height: 5em;
}

button {
    border-radius: 0.5rem;
    padding: 0.3rem 0.5rem;
    margin: 0.2rem;
    background-color: rgb(85, 153, 158);
    border: 2px solid rgb(53, 97, 91);
    box-shadow: 0 0 0.2em rgba(3, 27, 31, 0.4);
    transition: all 200ms ease-out;
}

button:hover {
    background-color: rgb(189, 225, 228);
}

button:focus {
    outline: 0;
    box-shadow: 0 0 0.1em 0.2em rgba(222, 233, 143, 0.4);
}
</style>