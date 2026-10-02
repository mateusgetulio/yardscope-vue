<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import Layout from '@/components/layout.vue';
import PipelinePanel from '@/components/pipeline-panel.vue';
import LineCard from '@/components/result/line-card.vue';
import ModelNote from '@/components/result/model-note.vue';
import { Badge, Notice, PhotoGrid, SectionTitle } from '@/components/ui';
import {
    buttonPrimary,
    buttonSecondary,
    cardClass,
    readinessTone,
} from '@/lib/styles';
import type { PipelineView, RequestView } from '@/types/scope';

const props = defineProps<{
    request: RequestView;
    pipeline: PipelineView;
}>();

const page = usePage();
const errors = computed(() => page.props.errors);
const booking = ref(false);

function book() {
    router.post(
        `/requests/${props.request.id}/book`,
        {},
        {
            onStart: () => (booking.value = true),
            onFinish: () => (booking.value = false),
        },
    );
}

function headline(request: RequestView): string {
    if (request.booked) {
        return 'Your job is booked';
    }

    switch (request.readiness) {
        case 'ready':
            return 'Everything you asked for is priced';
        case 'partial':
            return 'Part of the job is priced now';
        case 'needs_photos':
            return 'We need a photo before we can price this';
        default:
            return 'A pro will quote this on site';
    }
}
</script>

<template>
    <Layout title="Your job">
        <div class="flex flex-wrap items-center gap-2">
            <Badge :tone="readinessTone[request.readiness]">
                {{ request.readinessLabel }}
            </Badge>
            <Badge v-if="request.booked" tone="green">
                Booked at {{ request.bookedPrice }}
            </Badge>
        </div>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">
            {{ headline(request) }}
        </h1>
        <blockquote
            class="mt-3 border-l-2 border-stone-300 pl-3 text-stone-600"
        >
            “{{ request.sentence }}”
        </blockquote>

        <div class="mt-6 space-y-3">
            <Notice v-if="request.proMessage" tone="blue">
                {{ request.proMessage }}
            </Notice>
            <ModelNote v-if="request.requestNote" :note="request.requestNote" />
            <Notice v-if="errors.correction" tone="red">
                {{ errors.correction }}
            </Notice>
            <Notice v-if="errors.photo" tone="red">{{ errors.photo }}</Notice>
        </div>

        <section class="mt-6">
            <PhotoGrid :photos="request.photos" />
        </section>

        <section class="mt-10 space-y-3">
            <SectionTitle>Here is what we found</SectionTitle>
            <LineCard
                v-for="line in request.lines"
                :key="line.id"
                :line="line"
                :request="request"
            />
            <p
                v-if="request.rejected.length > 0"
                class="text-sm text-stone-500"
            >
                Left out because the analysis could not be read:
                {{
                    request.rejected
                        .map((line) => line.label.toLowerCase())
                        .join(', ')
                }}. A pro can look at it on site.
            </p>
            <p
                v-if="request.unsupportedRequests.length > 0"
                class="text-sm text-stone-500"
            >
                Not offered yet: {{ request.unsupportedRequests.join(', ') }}.
            </p>
        </section>

        <div v-if="request.access.narrowGatePossible" class="mt-6">
            <Notice tone="amber">
                <span class="font-medium">Your side gate may be narrow.</span>
                Is it at least 36 inches wide? Your pro will confirm before
                bringing equipment.
            </Notice>
        </div>

        <section :class="`mt-8 p-5 sm:p-6 ${cardClass}`">
            <div
                class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <template v-if="request.estimate">
                        <p class="text-xs font-medium text-stone-500">
                            Estimate
                        </p>
                        <p
                            class="text-4xl font-semibold tracking-tight tabular-nums"
                        >
                            {{ request.estimate.price }}
                        </p>
                        <p class="mt-1 text-sm text-stone-600">
                            {{ request.estimate.hours }} of work, including a
                            {{ request.estimate.visitFee }} visit fee
                        </p>
                    </template>
                    <p v-else class="text-lg font-medium text-stone-600">
                        No price yet
                    </p>
                    <p
                        v-if="request.excludedSummary"
                        class="mt-2 text-sm text-stone-600"
                    >
                        {{ request.excludedSummary }}
                    </p>
                    <p class="mt-2 text-xs text-stone-400">
                        Synthetic demo rates.
                    </p>
                </div>
                <div class="shrink-0">
                    <Link
                        v-if="request.booked"
                        :href="`/requests/${request.id}/booked`"
                        :class="`${buttonSecondary} w-full py-2 sm:w-auto`"
                    >
                        See the confirmation
                    </Link>
                    <button
                        v-else
                        type="button"
                        :disabled="!request.cta.enabled || booking"
                        :class="`${buttonPrimary} w-full px-5 py-2.5 text-base sm:w-auto`"
                        @click="book"
                    >
                        {{ request.cta.label }}
                    </button>
                </div>
            </div>
            <p v-if="errors.booking" class="mt-3 text-sm text-red-700">
                {{ errors.booking }}
            </p>
        </section>

        <PipelinePanel :pipeline="pipeline" />
    </Layout>
</template>
