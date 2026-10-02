import { createInertiaApp } from '@inertiajs/vue3';

const appName = import.meta.env.VITE_APP_NAME || 'YardScope';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: { color: '#2F54EB' },
});
