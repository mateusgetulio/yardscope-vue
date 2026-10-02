<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { computed, ref, watchEffect } from 'vue';
import Layout from '@/components/layout.vue';
import { PhotoNumber } from '@/components/ui';
import { buttonPrimary, cardClass, inputClass } from '@/lib/styles';

interface Props {
    profile: Record<string, string>;
    extractor: 'fixtures' | 'api' | 'claude-code';
}

defineProps<Props>();

const MAX_SENTENCE = 300;

const form = useForm<{ sentence: string; photos: File[] }>({
    sentence: '',
    photos: [],
});
const previews = ref<string[]>([]);
const dragging = ref(false);
const accepted = ['image/jpeg', 'image/png', 'image/webp'];

watchEffect((onCleanup) => {
    const urls = previews.value;
    onCleanup(() => urls.forEach((url) => URL.revokeObjectURL(url)));
});

function choosePhotos(files: File[]) {
    form.photos = files;
    previews.value = files.map((photo) => URL.createObjectURL(photo));
}

function onPhotosChange(event: Event) {
    const input = event.target as HTMLInputElement;
    choosePhotos(Array.from(input.files ?? []).slice(0, 4));
    input.value = '';
}

function removePhoto(index: number) {
    choosePhotos(form.photos.filter((_, position) => position !== index));
}

function onPhotosDrop(event: DragEvent) {
    dragging.value = false;
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
        accepted.includes(file.type),
    );
    if (files.length > 0) {
        choosePhotos(files.slice(0, 4));
    }
}

function onDragLeave(event: DragEvent) {
    const zone = event.currentTarget as HTMLElement;
    if (!zone.contains(event.relatedTarget as Node | null)) {
        dragging.value = false;
    }
}

const photoErrors = computed(() =>
    Object.entries(form.errors)
        .filter(([key]) => key.startsWith('photos'))
        .map(([, message]) => message),
);

function submit() {
    form.post('/requests', { forceFormData: true });
}

function describeProfile(profile: Record<string, string>): string {
    return Object.entries(profile)
        .map(([section, size]) => `${size} ${section.replace('_', ' ')}`)
        .join(', ');
}

function extractorNote(extractor: Props['extractor']): string {
    switch (extractor) {
        case 'api':
            return ' Photos are sent to the vision model.';
        case 'claude-code':
            return ' Photos are analyzed through the local Claude Code session.';
        default:
            return ' Running on recorded analyses, no model call.';
    }
}
</script>

<template>
    <Layout title="Request">
        <h1 class="text-3xl font-semibold tracking-tight">
            Turn yard photos into a bookable job
        </h1>
        <p class="mt-3 text-stone-600">
            Tell us what you need done and add two to four photos. We price what
            the photos show and ask for more when they do not show enough.
        </p>

        <form
            :class="`mt-8 space-y-6 p-5 sm:p-6 ${cardClass}`"
            @submit.prevent="submit"
        >
            <div>
                <div class="flex items-baseline justify-between">
                    <label for="sentence" class="text-sm font-medium">
                        What do you need done?
                    </label>
                    <span class="text-xs text-stone-400">
                        {{ form.sentence.length }}/{{ MAX_SENTENCE }}
                    </span>
                </div>
                <textarea
                    id="sentence"
                    v-model="form.sentence"
                    :maxlength="MAX_SENTENCE"
                    rows="3"
                    placeholder="My backyard is a mess. Clean it up and trim whatever needs trimming."
                    :class="`mt-2 ${inputClass}`"
                />
                <p
                    v-if="form.errors.sentence"
                    class="mt-1 text-sm text-red-700"
                >
                    {{ form.errors.sentence }}
                </p>
            </div>

            <div>
                <div class="flex items-baseline justify-between">
                    <span class="text-sm font-medium">Photos</span>
                    <span class="text-xs text-stone-400">
                        2 to 4, JPEG, PNG or WebP
                    </span>
                </div>
                <label
                    for="photos"
                    :class="`mt-2 grid cursor-pointer grid-cols-2 gap-2 rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 sm:grid-cols-4 ${dragging ? 'outline-2 outline-offset-2 outline-blue-600 outline-dashed' : ''}`"
                    @dragover.prevent="dragging = true"
                    @dragleave="onDragLeave"
                    @drop.prevent="onPhotosDrop"
                >
                    <template v-for="slot in [0, 1, 2, 3]" :key="slot">
                        <span v-if="previews[slot]" class="relative block">
                            <img
                                :src="previews[slot]"
                                :alt="`Photo ${slot + 1}`"
                                class="aspect-[4/3] w-full rounded-lg object-cover"
                            />
                            <PhotoNumber :number="slot + 1" />
                            <button
                                type="button"
                                :aria-label="`Remove photo ${slot + 1}`"
                                title="Remove this photo"
                                class="absolute top-1.5 right-1.5 rounded-md bg-black/60 p-1 text-white hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                @click.prevent.stop="removePhoto(slot)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    class="h-3.5 w-3.5"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </span>
                        <span
                            v-else
                            class="flex aspect-[4/3] flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-500 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                        >
                            <span class="text-lg leading-none text-stone-400">
                                +
                            </span>
                            <span class="text-xs">Photo {{ slot + 1 }}</span>
                            <span class="text-[11px] text-stone-400">
                                {{ slot < 2 ? 'required' : 'optional' }}
                            </span>
                        </span>
                    </template>
                    <input
                        id="photos"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        class="sr-only"
                        @change="onPhotosChange"
                    />
                </label>
                <p class="mt-2 text-xs text-stone-500">
                    {{
                        previews.length > 0
                            ? 'Click or drop new photos to choose a different set. '
                            : 'Choose or drop all your photos at once. '
                    }}Location data is removed from every photo.
                </p>
                <p
                    v-for="message in photoErrors"
                    :key="message"
                    class="mt-1 text-sm text-red-700"
                >
                    {{ message }}
                </p>
            </div>

            <div
                class="flex flex-col gap-4 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <p class="text-xs text-stone-500 sm:max-w-sm">
                    Simulated property: {{ describeProfile(profile) }}.{{
                        extractorNote(extractor)
                    }}
                </p>
                <button
                    type="submit"
                    :disabled="form.processing"
                    :class="`${buttonPrimary} w-full py-2.5 sm:w-auto`"
                >
                    {{
                        form.processing
                            ? 'Analyzing photos…'
                            : 'Analyze my yard'
                    }}
                </button>
            </div>
        </form>
    </Layout>
</template>
