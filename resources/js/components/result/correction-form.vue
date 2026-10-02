<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { computed } from 'vue';
import { buttonPrimary, inputClass } from '@/lib/styles';
import type { CorrectionInput, ScopeLineView } from '@/types/scope';

const props = defineProps<{
    line: ScopeLineView;
    requestId: string;
}>();

const emit = defineEmits<{
    done: [];
}>();

const sizes: string[] = ['small', 'medium', 'large'];
const severities: string[] = ['light', 'moderate', 'heavy'];

const initialField: CorrectionInput['field'] = props.line.counted
    ? 'quantity'
    : 'severity';
const form = useForm<CorrectionInput>({
    line_id: props.line.id,
    field: initialField,
    model_value: currentValue(props.line, initialField),
    customer_value: currentValue(props.line, initialField),
    reason: '',
});

function chooseField(field: CorrectionInput['field']) {
    form.field = field;
    form.model_value = currentValue(props.line, field);
    form.customer_value = currentValue(props.line, field);
}

function onFieldChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const chosen = fields.value.find((field) => field === value);
    if (chosen !== undefined) {
        chooseField(chosen);
    }
}

function setCustomerValue(event: Event) {
    form.customer_value = (event.target as HTMLInputElement).value;
}

function submit() {
    form.post(`/requests/${props.requestId}/corrections`, {
        onSuccess: () => emit('done'),
    });
}

const fields = computed<CorrectionInput['field'][]>(() => [
    ...(props.line.counted ? (['quantity'] as const) : []),
    ...(props.line.usesSize ? (['size'] as const) : []),
    ...(props.line.severity !== null ? (['severity'] as const) : []),
]);

function currentValue(
    line: ScopeLineView,
    field: CorrectionInput['field'],
): string {
    switch (field) {
        case 'quantity':
            return line.quantity === null ? '' : String(line.quantity);
        case 'size':
            return line.size ?? '';
        case 'severity':
            return line.severity ?? '';
        default:
            return '';
    }
}
</script>

<template>
    <form
        class="mt-3 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-3"
        @submit.prevent="submit"
    >
        <label class="block">
            <span class="text-xs font-medium text-stone-600">
                What is off?
            </span>
            <select
                :value="form.field"
                :class="`mt-1 ${inputClass}`"
                @change="onFieldChange"
            >
                <option v-for="field in fields" :key="field" :value="field">
                    {{ field === 'quantity' ? 'count' : field }}
                </option>
            </select>
        </label>
        <label class="block">
            <span class="text-xs font-medium text-stone-600">
                Should be (now {{ form.model_value }})
            </span>
            <input
                v-if="form.field === 'quantity'"
                type="number"
                min="1"
                max="20"
                :value="form.customer_value"
                :class="`mt-1 ${inputClass}`"
                @input="setCustomerValue"
            />
            <select
                v-else
                v-model="form.customer_value"
                :class="`mt-1 ${inputClass}`"
            >
                <option
                    v-for="option in form.field === 'size' ? sizes : severities"
                    :key="option"
                    :value="option"
                >
                    {{ option }}
                </option>
            </select>
        </label>
        <label class="block">
            <span class="text-xs font-medium text-stone-600">
                Why (optional)
            </span>
            <input
                v-model="form.reason"
                type="text"
                maxlength="200"
                placeholder="Two more behind the shed"
                :class="`mt-1 ${inputClass}`"
            />
        </label>
        <div class="sm:col-span-3">
            <button
                type="submit"
                :disabled="form.processing"
                :class="buttonPrimary"
            >
                Save correction
            </button>
        </div>
    </form>
</template>
