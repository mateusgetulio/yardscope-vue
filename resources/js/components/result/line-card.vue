<script setup lang="ts">
import { computed, ref } from 'vue';
import AddPhoto from '@/components/result/add-photo.vue';
import CorrectionButton from '@/components/result/correction-button.vue';
import CorrectionForm from '@/components/result/correction-form.vue';
import { Badge } from '@/components/ui';
import { buttonSecondary, cardClass, dispositionTone } from '@/lib/styles';
import type { RequestView, ScopeLineView } from '@/types/scope';

const props = defineProps<{
    line: ScopeLineView;
    request: RequestView;
}>();

const accent: Record<ScopeLineView['disposition'], string> = {
    priceable: 'border-l-green-500',
    needs_photos: 'border-l-amber-400',
    manual_quote: 'border-l-stone-400',
    suggested: 'border-l-blue-400',
    rejected: 'border-l-stone-200',
};

const editing = ref(false);
const editable = computed(() => !props.request.booked);
const photos = computed(() => [
    ...new Set(props.line.evidence.map((item) => item.photo)),
]);
</script>

<template>
    <article
        :class="`border-l-4 p-4 ${cardClass} ${accent[line.disposition]} ${line.disposition === 'rejected' ? 'text-stone-500' : ''}`"
    >
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div class="min-w-0">
                <h3 class="font-semibold">
                    {{ line.label
                    }}<span
                        v-if="line.section"
                        class="font-normal text-stone-500"
                        >, {{ line.section }}</span
                    >
                </h3>
                <p class="text-sm">{{ line.summary }}</p>
                <p
                    v-if="line.origin === 'customer_corrected'"
                    class="mt-0.5 text-xs text-amber-800"
                >
                    You corrected this{{
                        line.observedSummary
                            ? ` from “${line.observedSummary}”`
                            : ''
                    }}{{ line.lastReason ? `: ${line.lastReason}` : '.' }}
                </p>
            </div>
            <div
                class="flex flex-row-reverse flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end sm:gap-1 sm:text-right"
            >
                <Badge :tone="dispositionTone[line.disposition]">
                    {{ line.dispositionLabel }}
                </Badge>
                <p
                    v-if="line.hours"
                    class="text-sm text-stone-600 tabular-nums"
                >
                    {{ line.hours
                    }}{{ line.labor ? `, ${line.labor} labor` : '' }}
                </p>
            </div>
        </div>
        <p v-if="line.note" class="mt-2 text-sm">{{ line.note }}</p>
        <p
            v-if="line.photoRequest"
            class="mt-2 text-sm font-medium text-amber-900"
        >
            {{ line.photoRequest }}
        </p>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs text-stone-500">
                {{ line.checksPassed }} of {{ line.checksTotal }} checks
                passed{{
                    photos.length > 0
                        ? `, seen in photo ${photos.join(', ')}`
                        : ''
                }}
            </p>
            <div v-if="editable" class="flex flex-wrap items-center gap-2">
                <CorrectionButton
                    v-if="line.canAdd"
                    :request-id="request.id"
                    :input="{
                        line_id: line.id,
                        field: 'added',
                        model_value: '',
                        customer_value: '',
                        reason: '',
                    }"
                    :label="line.removed ? 'Put it back' : 'Add to job'"
                />
                <AddPhoto
                    v-if="
                        line.disposition === 'needs_photos' &&
                        request.canAddPhoto
                    "
                    :request-id="request.id"
                />
                <button
                    v-if="line.canChange"
                    type="button"
                    :aria-expanded="editing"
                    :class="buttonSecondary"
                    @click="editing = !editing"
                >
                    {{ editing ? 'Cancel' : 'Correct this' }}
                </button>
                <CorrectionButton
                    v-if="line.canRemove"
                    :request-id="request.id"
                    :input="{
                        line_id: line.id,
                        field: 'removed',
                        model_value: '',
                        customer_value: '',
                        reason: '',
                    }"
                    :label="line.placeholder ? 'Skip this' : 'Remove'"
                />
            </div>
        </div>

        <CorrectionForm
            v-if="editing"
            :line="line"
            :request-id="request.id"
            @done="editing = false"
        />
    </article>
</template>
