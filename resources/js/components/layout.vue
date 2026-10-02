<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';

defineProps<{
    title: string;
}>();
</script>

<template>
    <Head :title="title" />
    <header class="border-b border-stone-200 bg-white">
        <div
            class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
        >
            <Link
                href="/"
                class="flex items-baseline gap-2 font-semibold tracking-tight text-stone-900"
            >
                YardScope
                <span class="text-xs font-normal text-stone-500">
                    prototype, synthetic rates
                </span>
            </Link>
            <nav class="flex gap-4 text-sm text-stone-600">
                <Link href="/" class="hover:text-stone-900">New request</Link>
                <Link href="/evals" class="hover:text-stone-900">Evals</Link>
            </nav>
        </div>
    </header>
    <main class="mx-auto max-w-3xl px-4 pt-8 pb-16">
        <slot />
    </main>
</template>
