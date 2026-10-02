<script setup lang="ts">
defineProps<{
    number: number;
}>();
</script>

<template>
    <span
        class="absolute top-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white"
    >
        {{ number }}
    </span>
</template>
