<script lang="ts">

export let message = "";
</script>

<div class="message">{ @html message }</div>

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
</style>