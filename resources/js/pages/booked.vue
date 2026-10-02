<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import Layout from '@/components/layout.vue';
import { buttonPrimary, buttonSecondary, cardClass } from '@/lib/styles';
import type { RequestView } from '@/types/scope';

const props = defineProps<{
    request: RequestView;
}>();

const priced = computed(() =>
    props.request.lines.filter((line) => line.disposition === 'priceable'),
);
</script>

<template>
    <Layout title="Booked">
        <div :class="`p-6 sm:p-8 ${cardClass}`">
            <div class="flex items-start gap-4">
                <span
                    aria-hidden="true"
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700"
                >
                    ✓
                </span>
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">
                        Booked at {{ request.bookedPrice }}
                    </h1>
                    <p class="mt-1 text-sm text-stone-600">
                        A pro gets a brief built from exactly what you saw, with
                        every value marked as seen in the photos or corrected by
                        you. Synthetic demo rates.
                    </p>
                </div>
            </div>

            <dl
                class="mt-6 divide-y divide-stone-100 border-y border-stone-100"
            >
                <div
                    v-for="line in priced"
                    :key="line.id"
                    class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3 text-sm"
                >
                    <dt>
                        <span class="font-medium"
                            >{{ line.label
                            }}{{
                                line.section ? `, ${line.section}` : ''
                            }}</span
                        ><span class="ml-2 text-stone-500">{{
                            line.summary.toLowerCase()
                        }}</span>
                    </dt>
                    <dd class="text-stone-600 tabular-nums">
                        {{ line.hours }}
                    </dd>
                </div>
            </dl>

            <div
                v-if="
                    request.excludedSummary || request.access.narrowGatePossible
                "
                class="mt-4 space-y-1 text-sm text-stone-600"
            >
                <p v-if="request.excludedSummary">
                    {{ request.excludedSummary }}
                </p>
                <p v-if="request.access.narrowGatePossible">
                    Your pro will confirm the side gate width before bringing
                    equipment.
                </p>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
                <Link
                    :href="`/requests/${request.id}/pro`"
                    :class="buttonPrimary"
                >
                    See what the pro sees
                </Link>
                <Link
                    :href="`/requests/${request.id}`"
                    :class="`${buttonSecondary} py-2`"
                >
                    Back to the job
                </Link>
            </div>
        </div>
    </Layout>
</template>
