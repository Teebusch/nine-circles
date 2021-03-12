<script lang="ts">

import { Client } from 'boardgame.io/client';
import { NineCircles } from './Game'
import Board from './Board.svelte'
import { onMount } from 'svelte';
import type { _ClientImpl } from 'boardgame.io/dist/types/src/client/client';

let client: _ClientImpl;
$: client = Client({
     game: NineCircles 
});

onMount(() => {
    client.start()
    return client.stop
})

</script>

<main>
    <Board { client } />
</main>