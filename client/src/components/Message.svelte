<script lang="ts">

// const messages = [
//     "<h2>It's your turn!</h2> You must play a card from your hand."
// ];

export let message = "";
</script>

<div class="message">
    <div>{ @html message }</div>
    <button on:click>Pass</button>
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