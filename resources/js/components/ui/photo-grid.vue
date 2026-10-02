<script setup lang="ts">
import PhotoNumber from './photo-number.vue';

defineProps<{
    photos: { number: number; url: string }[];
}>();
</script>

<template>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
            v-for="photo in photos"
            :key="photo.number"
            :href="photo.url"
            target="_blank"
            rel="noreferrer"
            class="relative block overflow-hidden rounded-lg ring-1 ring-stone-200"
        >
            <img
                :src="photo.url"
                :alt="`Photo ${photo.number}`"
                class="aspect-[4/3] w-full object-cover transition-transform hover:scale-[1.02]"
            />
            <PhotoNumber :number="photo.number" />
        </a>
    </div>
</template>
