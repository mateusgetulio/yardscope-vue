<script setup lang="ts">
import { computed } from 'vue';
import Layout from '@/components/layout.vue';
import { Badge, SectionTitle } from '@/components/ui';
import { cardClass } from '@/lib/styles';
import type { EvalResults } from '@/types/scope';

const props = defineProps<{
    results: EvalResults | null;
    file: string | null;
}>();

type EvalSet = EvalResults['sets'][number];

const metricLabels: Record<string, string> = {
    sets: 'Labeled sets',
    schema_valid_rate: 'Schema-valid answers',
    service_precision: 'Service precision',
    service_recall: 'Service recall',
    count_exact_rate: 'Counts exact',
    count_within_one_rate: 'Counts within one',
    hallucinated_lines: 'Hallucinated lines',
    duplicate_lines: 'Duplicate lines',
    severity_accuracy: 'Severity correct',
    size_accuracy: 'Size correct',
    disposition_accuracy: 'Dispositions correct',
    readiness_accuracy: 'Request readiness correct',
    photo_request_accuracy: 'Photo requests correct',
    counting_photo_accuracy: 'Counting photo correct',
    unusable_photo_accuracy: 'Unusable photos flagged',
};

const counts = new Set(['sets', 'hallucinated_lines', 'duplicate_lines']);

function format(name: string, value: number | null): string {
    if (value === null) {
        return 'n/a';
    }
    return counts.has(name) ? String(value) : `${Math.round(value * 100)}%`;
}

function service(key: string): string {
    const [type, section] = key.split('@');
    const label = type.replaceAll('_', ' ');
    const named = label.charAt(0).toUpperCase() + label.slice(1);

    return section === 'none'
        ? `${named} (no section)`
        : `${named}, ${section.replaceAll('_', ' ')}`;
}

function words(code: string | null): string {
    const named: Record<string, string> = {
        priceable: 'priced',
        needs_photos: 'needs photos',
        manual_quote: 'pro quote',
        suggested: 'suggested',
        rejected: 'rejected',
        ready: 'ready',
        partial: 'partial',
    };

    return code === null
        ? 'nothing'
        : (named[code] ?? code.replaceAll('_', ' '));
}

function misses(set: EvalSet): string[] {
    if (!set.schema_valid) {
        return [set.failure ?? 'No readable answer.'];
    }

    return [
        ...(set.readiness_correct === false
            ? [
                  `Readiness ${words(set.observed_readiness)}, label says ${words(set.expected_readiness)}`,
              ]
            : []),
        ...set.hallucinated.map((key) => `Hallucinated ${service(key)}`),
        ...set.counts
            .filter((count) => !count.exact)
            .map(
                (count) =>
                    `${service(count.service)}: counted ${count.observed ?? 'nothing'}, label says ${count.expected}`,
            ),
        ...set.attributes
            .filter((item) => !item.correct)
            .map(
                (item) =>
                    `${service(item.service)}: ${item.attribute} ${item.observed ?? 'missing'}, label says ${item.expected}`,
            ),
        ...set.counting_photos
            .filter((item) => !item.correct)
            .map(
                (item) =>
                    `${service(item.service)}: counted from photo ${item.observed ?? 'none'}, label says ${item.expected}`,
            ),
        ...set.dispositions
            .filter((line) => !line.correct)
            .map(
                (line) =>
                    `${service(line.service)}: ${line.observed === null ? 'no line' : words(line.observed)}, label says ${words(line.expected)}`,
            ),
        ...(set.duplicate_lines > 0
            ? [
                  `${set.duplicate_lines} duplicate line${set.duplicate_lines === 1 ? '' : 's'}`,
              ]
            : []),
        ...(set.photo_request_correct === false
            ? ['Photo request did not match the label']
            : []),
        ...(set.unusable_photos_correct === false
            ? ['Unusable photos not flagged as labeled']
            : []),
    ];
}

const sets = computed(() =>
    (props.results?.sets ?? []).map((set) => ({ set, found: misses(set) })),
);
</script>

<template>
    <Layout title="Evals">
        <h1 class="text-3xl font-semibold tracking-tight">Latest eval run</h1>
        <p v-if="results === null" class="mt-3 text-stone-600">
            No run recorded yet. Run
            <code class="rounded bg-stone-100 px-1"
                >php artisan yardscope:eval --live</code
            >
            or
            <code class="rounded bg-stone-100 px-1">--fixtures</code>.
        </p>
        <template v-else>
            <p class="mt-3 text-stone-600">
                {{
                    results.mode === 'live'
                        ? `Live run through the ${results.driver} driver`
                        : 'Replay of recorded answers'
                }}
                on {{ new Date(results.ran_at).toLocaleString() }}. Numbers are
                exactly what the run produced.
            </p>
            <p class="mt-1 font-mono text-xs text-stone-400">
                evals/results/{{ file }}
            </p>

            <dl class="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div
                    v-for="(value, name) in results.metrics"
                    :key="name"
                    :class="`px-4 py-3 ${cardClass}`"
                >
                    <dd class="text-2xl font-semibold tabular-nums">
                        {{ format(name, value) }}
                    </dd>
                    <dt class="mt-0.5 text-xs text-stone-500">
                        {{ metricLabels[name] ?? name }}
                    </dt>
                </div>
            </dl>

            <section class="mt-10 space-y-3">
                <SectionTitle>Per set</SectionTitle>
                <article
                    v-for="{ set, found } in sets"
                    :key="set.slug"
                    :class="`p-4 ${cardClass}`"
                >
                    <div
                        class="flex flex-wrap items-center justify-between gap-2"
                    >
                        <h2 class="font-medium">{{ set.slug }}</h2>
                        <div class="flex gap-1.5">
                            <Badge tone="stone">
                                {{ set.scenario.replaceAll('_', ' ') }}
                            </Badge>
                            <Badge v-if="found.length === 0" tone="green">
                                matches labels
                            </Badge>
                            <Badge v-else tone="amber">
                                {{ found.length }}
                                {{ found.length === 1 ? 'miss' : 'misses' }}
                            </Badge>
                        </div>
                    </div>
                    <p
                        v-if="set.schema_valid"
                        class="mt-2 text-sm text-stone-600"
                    >
                        {{ words(set.observed_readiness) }},
                        {{
                            set.observed_services.length > 0
                                ? set.observed_services.map(service).join('; ')
                                : 'no service lines from the model'
                        }}
                    </p>
                    <ul
                        v-if="found.length > 0"
                        class="mt-2 space-y-0.5 text-sm text-amber-900"
                    >
                        <li
                            v-for="miss in found"
                            :key="miss"
                            class="flex gap-2"
                        >
                            <span aria-hidden="true">✗</span>
                            <span>{{ miss }}</span>
                        </li>
                    </ul>
                </article>
            </section>
        </template>
    </Layout>
</template>
