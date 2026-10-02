<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { buttonSecondary } from '@/lib/styles';
import type { CorrectionInput } from '@/types/scope';

const props = defineProps<{
    requestId: string;
    input: CorrectionInput;
    label: string;
}>();

const form = useForm<CorrectionInput>(props.input);
</script>

<template>
    <button
        type="button"
        :disabled="form.processing"
        :class="buttonSecondary"
        @click="form.post(`/requests/${requestId}/corrections`)"
    >
        {{ label }}
    </button>
</template>
