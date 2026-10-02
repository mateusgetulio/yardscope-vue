<script setup lang="ts">
import { ref } from 'vue';
import Stage from '@/components/pipeline-stage.vue';
import { cardClass } from '@/lib/styles';
import type { PipelineView } from '@/types/scope';

defineProps<{
    pipeline: PipelineView;
}>();

const open = ref(false);

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
</script>

<template>
    <section :class="`mt-10 overflow-hidden ${cardClass}`">
        <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-stone-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
            :aria-expanded="open"
            @click="open = !open"
        >
            <span>
                <span class="block text-sm font-semibold">
                    How this request was processed
                </span>
                <span class="block text-xs text-stone-500">
                    Photos, extraction, validation, dispositions, pricing and
                    corrections, with the actual values
                </span>
            </span>
            <span
                aria-hidden="true"
                :class="`text-lg leading-none text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`"
            >
                ▸
            </span>
        </button>
        <div
            v-if="open"
            class="divide-y divide-stone-100 border-t border-stone-200 bg-stone-50/60 text-sm"
        >
            <Stage title="Photos">
                <ul class="space-y-1">
                    <li v-for="photo in pipeline.photos" :key="photo.number">
                        Photo {{ photo.number }}:
                        {{
                            photo.view === null
                                ? 'not described'
                                : `${photo.view} view of ${photo.sections.length > 0 ? photo.sections.join(', ').replaceAll('_', ' ') : 'no section'}, ${photo.usable ? 'usable' : 'not usable'}`
                        }}
                    </li>
                </ul>
            </Stage>
            <Stage title="Extraction">
                <p>Driver: {{ pipeline.extraction.driver }}</p>
                <ul class="space-y-1">
                    <li v-for="run in pipeline.extraction.runs" :key="run.id">
                        Run {{ run.id }}: {{ run.photoCount }} photos,
                        {{
                            run.failure
                                ? `failed (${run.failure})`
                                : `${run.lines} service lines`
                        }}
                    </li>
                </ul>
            </Stage>
            <Stage title="Validation">
                <p
                    v-if="
                        pipeline.validation.rejected.length === 0 &&
                        pipeline.validation.unsupportedRequests.length === 0
                    "
                >
                    Every line passed the schema and evidence rules.
                </p>
                <ul v-else class="space-y-1">
                    <li
                        v-for="(line, index) in pipeline.validation.rejected"
                        :key="`rejected-${index}`"
                    >
                        Rejected {{ line.type }}: {{ line.reason }}
                    </li>
                    <li
                        v-for="request in pipeline.validation
                            .unsupportedRequests"
                        :key="request"
                    >
                        Not offered: {{ request }}
                    </li>
                </ul>
                <p
                    v-if="pipeline.validation.requestNote"
                    class="text-stone-600"
                >
                    Model note: {{ pipeline.validation.requestNote }}
                </p>
            </Stage>
            <Stage title="Dispositions">
                <ul class="space-y-2">
                    <li v-for="line in pipeline.dispositions" :key="line.id">
                        <span class="font-medium">{{ line.label }}</span>
                        {{ ' ' }}
                        <span class="text-stone-500">
                            {{ line.id }}, {{ line.disposition }}
                        </span>
                        <ul class="mt-0.5 space-y-0.5">
                            <li
                                v-for="check in line.checks"
                                :key="check.rule"
                                class="flex gap-2"
                            >
                                <span
                                    :class="`w-10 shrink-0 font-mono text-xs leading-5 ${check.passed ? 'text-green-700' : 'text-amber-700'}`"
                                >
                                    {{ check.passed ? '✓' : '✗' }}
                                    {{ check.rule }}
                                </span>
                                <span>{{ check.message }}</span>
                            </li>
                        </ul>
                    </li>
                </ul>
            </Stage>
            <Stage title="Pricing">
                <p v-if="pipeline.pricing === null">
                    No priceable line, so no price.
                </p>
                <template v-else>
                    <ul class="space-y-1 tabular-nums">
                        <li
                            v-for="line in pipeline.pricing.lines"
                            :key="line.id"
                        >
                            {{ line.id }}: {{ line.lowHours.toFixed(2) }} to
                            {{ line.highHours.toFixed(2) }} h,
                            {{ money(line.laborCents) }} labor
                        </li>
                    </ul>
                    <p class="text-stone-600">
                        Total {{ pipeline.pricing.lowHours.toFixed(3) }} to
                        {{ pipeline.pricing.highHours.toFixed(3) }} h, shown as
                        {{ pipeline.pricing.shownLowHours }} to
                        {{ pipeline.pricing.shownHighHours }} h. Midpoint
                        {{ pipeline.pricing.midpointHours.toFixed(4) }} h at
                        {{ money(pipeline.pricing.hourlyRateCents) }}/h plus the
                        {{ money(pipeline.pricing.visitFeeCents) }} visit fee,
                        rounded up to the next
                        {{ money(pipeline.pricing.priceRoundingCents) }}:
                        {{ money(pipeline.pricing.priceCents) }}.
                    </p>
                </template>
            </Stage>
            <Stage title="Corrections">
                <p
                    v-if="
                        pipeline.corrections.length === 0 &&
                        pipeline.proActions.length === 0
                    "
                >
                    None.
                </p>
                <ul v-else class="space-y-1">
                    <li
                        v-for="(correction, index) in pipeline.corrections"
                        :key="index"
                    >
                        Run {{ correction.run }}, {{ correction.lineId }}
                        {{ correction.field }}:
                        {{ correction.modelValue || 'n/a' }} to
                        {{ correction.customerValue || 'n/a' }}
                        ({{ correction.source
                        }}{{
                            correction.reason ? `, ${correction.reason}` : ''
                        }}){{ correction.skipped ? ', skipped' : ''
                        }}{{ correction.current ? '' : ', earlier run' }}
                    </li>
                    <li
                        v-for="(action, index) in pipeline.proActions"
                        :key="`pro-${index}`"
                    >
                        Pro: {{ action.label.toLowerCase()
                        }}{{
                            action.adjustedPriceCents !== null
                                ? ` to ${money(action.adjustedPriceCents)}`
                                : ''
                        }}{{ action.reason ? `, ${action.reason}` : '' }}
                    </li>
                </ul>
            </Stage>
        </div>
    </section>
</template>
