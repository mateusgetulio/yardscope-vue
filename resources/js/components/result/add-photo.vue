<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import { ref } from 'vue';
import { buttonSecondary } from '@/lib/styles';

const props = defineProps<{
    requestId: string;
}>();

const sending = ref(false);

function send(event: Event) {
    const photo = (event.target as HTMLInputElement).files?.[0];
    if (photo === undefined) {
        return;
    }
    router.post(
        `/requests/${props.requestId}/photos`,
        { photo },
        {
            forceFormData: true,
            onStart: () => (sending.value = true),
            onFinish: () => (sending.value = false),
        },
    );
}
</script>

<template>
    <label
        title="Runs the analysis again; your corrections are kept where they still apply."
        :class="`${buttonSecondary} cursor-pointer border-amber-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 ${sending ? 'opacity-60' : ''}`"
    >
        {{ sending ? 'Analyzing again…' : 'Add photo' }}
        <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="sr-only"
            :disabled="sending"
            @change="send"
        />
    </label>
</template>
