<script setup lang="ts">
import { router, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';
import { buttonPrimary, buttonSecondary, inputClass } from '@/lib/styles';
import type { ProActionKind } from '@/types/scope';

const props = defineProps<{
    requestId: string;
}>();

const accepting = ref(false);
const form = useForm<{
    kind: ProActionKind | '';
    reason: string;
    adjusted_price: string;
}>({ kind: '', reason: '', adjusted_price: '' });

function accept() {
    router.post(
        `/requests/${props.requestId}/pro/actions`,
        { kind: 'accept_scope' },
        {
            onStart: () => (accepting.value = true),
            onFinish: () => (accepting.value = false),
        },
    );
}

function toggle(kind: ProActionKind) {
    form.kind = form.kind === kind ? '' : kind;
    form.reason = '';
    form.adjusted_price = '';
    form.clearErrors();
}

function setAdjustedPrice(event: Event) {
    form.adjusted_price = (event.target as HTMLInputElement).value;
}

function submit() {
    form.post(`/requests/${props.requestId}/pro/actions`, {
        onSuccess: () => form.reset(),
    });
}

const openClass = (kind: ProActionKind) =>
    form.kind === kind ? 'border-blue-600 ring-2 ring-blue-600/20' : '';
</script>

<template>
    <div class="mt-4">
        <div class="flex flex-wrap gap-2">
            <button
                type="button"
                :disabled="accepting"
                :class="buttonPrimary"
                @click="accept"
            >
                Accept scope
            </button>
            <button
                type="button"
                :aria-expanded="form.kind === 'request_photo'"
                :class="`${buttonSecondary} py-2 ${openClass('request_photo')}`"
                @click="toggle('request_photo')"
            >
                Request photo
            </button>
            <button
                type="button"
                :aria-expanded="form.kind === 'adjust_quote'"
                :class="`${buttonSecondary} py-2 ${openClass('adjust_quote')}`"
                @click="toggle('adjust_quote')"
            >
                Adjust quote
            </button>
        </div>
        <p v-if="form.errors.kind" class="mt-2 text-sm text-red-700">
            {{ form.errors.kind }}
        </p>
        <form
            v-if="form.kind === 'request_photo' || form.kind === 'adjust_quote'"
            class="mt-3 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-3"
            @submit.prevent="submit"
        >
            <label v-if="form.kind === 'adjust_quote'" class="block">
                <span class="text-xs font-medium text-stone-600">
                    Adjusted price, $
                </span>
                <input
                    type="number"
                    min="0"
                    step="1"
                    :value="form.adjusted_price"
                    :class="`mt-1 ${inputClass}`"
                    @input="setAdjustedPrice"
                />
                <span
                    v-if="form.errors.adjusted_price"
                    class="mt-1 block text-red-700"
                >
                    {{ form.errors.adjusted_price }}
                </span>
            </label>
            <label
                :class="`block ${form.kind === 'adjust_quote' ? 'sm:col-span-2' : 'sm:col-span-3'}`"
            >
                <span class="text-xs font-medium text-stone-600">
                    {{
                        form.kind === 'request_photo'
                            ? 'What should the customer photograph?'
                            : 'Why'
                    }}
                </span>
                <input
                    v-model="form.reason"
                    type="text"
                    maxlength="200"
                    :class="`mt-1 ${inputClass}`"
                />
                <span v-if="form.errors.reason" class="mt-1 block text-red-700">
                    {{ form.errors.reason }}
                </span>
            </label>
            <div class="sm:col-span-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    :class="buttonPrimary"
                >
                    {{
                        form.kind === 'request_photo'
                            ? 'Send photo request'
                            : 'Save adjustment'
                    }}
                </button>
            </div>
        </form>
    </div>
</template>
