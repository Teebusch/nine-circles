<script lang="ts">

</script>

<div class="circle"></div>

<style>
.circle {
    border: max(2px, 0.3em) solid rgb(53, 97, 91);
    border-radius: 50%;
    width: calc(var(--card-w) / 3);
    height: calc(var(--card-w) / 3);
}

.circle.p1-won {
    transform: translateY(calc(var(--card-w) / -3));
    border-color: white;
    background: white;
    box-shadow: rgb(209, 192, 147) 0 0 1em;
}

.circle.p2-won {
    transform: translateY(calc(var(--card-w) / 3));
    border-color: white;
    background: white;
    box-shadow: rgb(209, 192, 147) 0 0 1em;
}
</style>