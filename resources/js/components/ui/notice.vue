<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    tone: 'amber' | 'blue' | 'red' | 'stone';
}>();

const classes = computed(
    () =>
        ({
            amber: 'border-amber-200 bg-amber-50 text-amber-950',
            blue: 'border-blue-200 bg-blue-50 text-blue-950',
            red: 'border-red-200 bg-red-50 text-red-900',
            stone: 'border-stone-200 bg-stone-100 text-stone-800',
        })[props.tone],
);
</script>

<template>
    <div :class="`rounded-lg border px-4 py-3 text-sm ${classes}`">
        <slot />
    </div>
</template>
