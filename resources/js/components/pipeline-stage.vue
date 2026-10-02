<script setup lang="ts">
defineProps<{
    title: string;
}>();
</script>

<template>
    <div class="grid gap-1 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
        <h3
            class="text-xs font-semibold tracking-wider text-stone-500 uppercase sm:pt-0.5"
        >
            {{ title }}
        </h3>
        <div class="min-w-0 space-y-1 break-words"><slot /></div>
    </div>
</template>
