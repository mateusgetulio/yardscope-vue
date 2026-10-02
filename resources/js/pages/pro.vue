<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import Layout from '@/components/layout.vue';
import PipelinePanel from '@/components/pipeline-panel.vue';
import ProActions from '@/components/pro/pro-actions.vue';
import { Badge, Notice, PhotoNumber, SectionTitle } from '@/components/ui';
import { cardClass, dispositionTone } from '@/lib/styles';
import type { BriefView, PipelineView } from '@/types/scope';

defineProps<{
    brief: BriefView;
    pipeline: PipelineView;
}>();
</script>

<template>
    <Layout title="Pre-visit brief">
        <div class="flex flex-wrap items-center gap-2">
            <Badge tone="blue">For the pro</Badge>
            <Badge tone="stone">{{ brief.readinessLabel }}</Badge>
            <Badge v-if="brief.booked" tone="green">
                Booked at {{ brief.bookedPrice }}
            </Badge>
        </div>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">
            Pre-visit brief
        </h1>
        <blockquote
            class="mt-3 border-l-2 border-stone-300 pl-3 text-stone-600"
        >
            “{{ brief.sentence }}”
        </blockquote>
        <p class="mt-2 text-sm text-stone-500">
            <Link
                :href="`/requests/${brief.id}`"
                class="underline decoration-stone-300 underline-offset-2 hover:text-stone-800"
            >
                Open the customer view
            </Link>
        </p>

        <section class="mt-8 space-y-3">
            <SectionTitle>Scope</SectionTitle>
            <article
                v-for="line in brief.lines"
                :key="line.id"
                :class="`p-4 ${cardClass} ${line.removedByCustomer || line.disposition === 'rejected' ? 'text-stone-500' : ''}`"
            >
                <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 class="font-semibold">
                            {{ line.label
                            }}{{ line.section ? `, ${line.section}` : '' }}
                        </h3>
                        <p class="mt-0.5 flex flex-wrap items-center gap-2">
                            <span>{{ line.summary }}</span>
                            <Badge
                                :tone="
                                    line.origin === 'customer_corrected'
                                        ? 'amber'
                                        : 'stone'
                                "
                            >
                                {{ line.originLabel }}
                            </Badge>
                        </p>
                    </div>
                    <Badge :tone="dispositionTone[line.disposition]">
                        {{ line.dispositionLabel }}
                    </Badge>
                </div>
                <p
                    v-if="line.observedSummary"
                    class="mt-2 text-sm text-stone-600"
                >
                    Seen in the photos: {{ line.observedSummary
                    }}{{
                        line.customerReason
                            ? `. Customer: “${line.customerReason}”`
                            : ''
                    }}
                </p>
                <p v-if="line.removedByCustomer" class="mt-2 text-sm">
                    Removed by the customer{{
                        line.customerReason ? `: “${line.customerReason}”` : ''
                    }}
                </p>
                <p
                    v-if="line.note && !line.removedByCustomer"
                    class="mt-2 text-sm"
                >
                    {{ line.note }}
                </p>
                <ul
                    v-if="line.evidence.length > 0"
                    class="mt-3 space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500"
                >
                    <li
                        v-for="(item, index) in line.evidence"
                        :key="index"
                        class="flex gap-2"
                    >
                        <span class="shrink-0 font-medium text-stone-600">
                            Photo {{ item.photo }}
                        </span>
                        <span>{{ item.note }}</span>
                    </li>
                </ul>
            </article>
        </section>

        <section
            v-if="
                brief.accessNotes.length > 0 || brief.openQuestions.length > 0
            "
            class="mt-8"
        >
            <Notice tone="amber">
                <p
                    v-for="note in brief.accessNotes"
                    :key="note"
                    class="font-medium"
                >
                    {{ note }}
                </p>
                <template v-if="brief.openQuestions.length > 0">
                    <h2
                        :class="`font-semibold ${brief.accessNotes.length > 0 ? 'mt-3' : ''}`"
                    >
                        Open questions
                    </h2>
                    <ul class="mt-1 list-disc space-y-1 pl-5">
                        <li
                            v-for="question in brief.openQuestions"
                            :key="question"
                        >
                            {{ question }}
                        </li>
                    </ul>
                </template>
            </Notice>
        </section>

        <section class="mt-8 space-y-3">
            <SectionTitle>Photos</SectionTitle>
            <div class="grid gap-4 sm:grid-cols-2">
                <figure
                    v-for="photo in brief.photos"
                    :key="photo.number"
                    :class="`overflow-hidden ${cardClass}`"
                >
                    <a
                        :href="photo.url"
                        target="_blank"
                        rel="noreferrer"
                        class="relative block"
                    >
                        <img
                            :src="photo.url"
                            :alt="`Photo ${photo.number}`"
                            class="aspect-[4/3] w-full object-cover"
                        />
                        <PhotoNumber :number="photo.number" />
                    </a>
                    <figcaption class="px-3 py-2 text-xs text-stone-600">
                        <span
                            v-if="photo.notes.length === 0"
                            class="text-stone-400"
                        >
                            Nothing noted on this photo.
                        </span>
                        <ul v-else class="space-y-1">
                            <li
                                v-for="(note, index) in photo.notes"
                                :key="index"
                            >
                                {{ note }}
                            </li>
                        </ul>
                    </figcaption>
                </figure>
            </div>
        </section>

        <section :class="`mt-8 p-5 ${cardClass}`">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                    <p class="text-xs text-stone-500">Current estimate</p>
                    <p class="text-2xl font-semibold tabular-nums">
                        {{
                            brief.estimate
                                ? brief.estimate.price
                                : 'No price yet'
                        }}
                    </p>
                </div>
                <p v-if="brief.estimate" class="text-sm text-stone-600">
                    {{ brief.estimate.hours }} of estimated work
                </p>
            </div>
            <ProActions :request-id="brief.id" />
            <ul
                v-if="brief.actions.length > 0"
                class="mt-5 space-y-1.5 border-t border-stone-100 pt-4 text-sm text-stone-600"
            >
                <li
                    v-for="action in brief.actions"
                    :key="action.id"
                    class="flex flex-wrap gap-2"
                >
                    <Badge
                        :tone="
                            action.kind === 'accept_scope'
                                ? 'green'
                                : action.kind === 'request_photo'
                                  ? 'amber'
                                  : 'blue'
                        "
                    >
                        {{ action.label
                        }}{{
                            action.adjustedPrice
                                ? ` to ${action.adjustedPrice}`
                                : ''
                        }}
                    </Badge>
                    <span v-if="action.reason">{{ action.reason }}</span>
                </li>
            </ul>
        </section>

        <PipelinePanel :pipeline="pipeline" />
    </Layout>
</template>
