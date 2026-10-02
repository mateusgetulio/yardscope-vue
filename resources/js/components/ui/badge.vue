<script setup lang="ts">
import { toneClasses, type Tone } from '@/lib/styles';

defineProps<{
    tone: Tone;
}>();
</script>

<template>
    <span
        :class="`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${toneClasses[tone]}`"
    >
        <slot />
    </span>
</template>
