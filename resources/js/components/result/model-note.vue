<script setup lang="ts">
import { computed, ref } from 'vue';
import { Notice } from '@/components/ui';

const props = defineProps<{
    note: string;
}>();

const open = ref(false);
const long = computed(() => props.note.length > 220);
</script>

<template>
    <Notice tone="stone">
        <p :class="open || !long ? '' : 'line-clamp-2'">
            <span class="font-medium">From the photo analysis: </span>
            {{ note }}
        </p>
        <button
            v-if="long"
            type="button"
            class="mt-1 text-xs font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
            @click="open = !open"
        >
            {{ open ? 'Show less' : 'Show the full note' }}
        </button>
    </Notice>
</template>
