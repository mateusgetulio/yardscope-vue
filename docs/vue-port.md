# From React to Vue in YardScope

This repo is a one to one port of the React frontend in [mateusgetulio/yardscope](https://github.com/mateusgetulio/yardscope). The Laravel side did not change, so every page gets the same props from the same `Inertia::render` call. The table shows each React pattern the original used next to its Vue version, with a real example from this codebase.

| Pattern | React (original) | Vue (this repo) |
|---|---|---|
| `useState` | `pipeline-panel.tsx`: `const [open, setOpen] = useState(false)`, then `onClick={() => setOpen((value) => !value)}` | `pipeline-panel.vue`: `const open = ref(false)`, then `@click="open = !open"`. In the template you write `open`; in the script you write `open.value`. |
| `useMemo` | The original never calls `useMemo`. Derived values are plain variables that rerun on every render, for example `booked.tsx`: `const priced = request.lines.filter((line) => line.disposition === 'priceable')` | `booked.vue`: `const priced = computed(() => props.request.lines.filter(...))`. `computed` caches the result and reruns only when `props.request` changes. |
| `useEffect` | `request.tsx`: `useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])` frees the old preview URLs whenever the selection changes | `request.vue`: `watchEffect((onCleanup) => { const urls = previews.value; onCleanup(() => urls.forEach(...)) })`. No dependency array: Vue sees that the effect reads `previews.value` and reruns it when that changes. The cleanup also runs on unmount. |
| Props | `result.tsx`: `export default function ResultPage({ request, pipeline }: Props)` | `result.vue`: `const props = defineProps<{ request: RequestView; pipeline: PipelineView }>()`. The template uses `request` directly; the script uses `props.request`. |
| Callbacks | `result.tsx`: the parent passes `onDone={() => setEditing(false)}` and `CorrectionForm` calls `onDone` | `correction-form.vue` declares `defineEmits<{ done: [] }>()` and calls `emit('done')`. The parent `line-card.vue` listens with `@done="editing = false"`. |
| Children | `layout.tsx`: `children: ReactNode`, rendered as `{children}` | `layout.vue`: `<slot />`. The parent's content goes wherever the slot is. |
| Inertia `useForm` | `request.tsx`: `form.data.sentence` to read, `form.setData('sentence', event.target.value)` to write | `request.vue`: the form is reactive, so `form.sentence` reads and `v-model="form.sentence"` writes. `form.errors`, `form.processing`, `form.post` and `form.reset` work the same. |
| Conditional rendering | `request.tsx`: `{form.errors.sentence && (<p>...</p>)}`; `result.tsx`: `{request.booked ? (<Link>...) : (<button>...)}` | `request.vue`: `<p v-if="form.errors.sentence">`; `result.vue`: `<Link v-if="request.booked">` followed by `<button v-else>` |
| Lists | `result.tsx`: `{request.lines.map((line) => (<LineCard key={line.id} line={line} request={request} />))}` | `result.vue`: `<LineCard v-for="line in request.lines" :key="line.id" :line="line" :request="request" />`. For objects, `v-for="(value, name) in results.metrics"` replaces `Object.entries(...).map(...)` (see `evals.vue`). |

## Things that changed shape

- A `.vue` file holds one component. The React files that held several components became one file each: `ui.tsx` became `components/ui/` (with an `index.ts` so imports stay `from '@/components/ui'`), the helpers inside `result.tsx` moved to `components/result/`, `ProActions` moved to `components/pro/`, and `Stage` became `components/pipeline-stage.vue`.
- `className` is `class`, and a value from the script needs a colon: `:class="buttonPrimary"`, `:href="..."`, `:disabled="form.processing"`.
- `v-model` on an `<input type="number">` turns the value into a number. The original always sent strings, so the two number inputs use `:value` plus an `@input` handler instead (see `setCustomerValue` in `correction-form.vue`).
- Spaces between tags work differently. JSX drops a line break between two elements and needs `{' '}` for a space; Vue does the same between two elements, but keeps one space between text and an element. Where the original had `{' '}` between two spans, the Vue template uses `{{ ' ' }}` (see the dispositions list in `pipeline-panel.vue`).
- `strictMode` in `app.tsx` is a React option and has no Vue equivalent, so `app.ts` drops it.
