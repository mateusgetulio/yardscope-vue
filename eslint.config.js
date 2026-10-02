import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['vendor/**', 'node_modules/**', 'public/**', 'bootstrap/**', 'storage/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    prettier,
    {
        files: ['resources/js/**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
        rules: {
            'no-undef': 'off',
        },
    },
    {
        files: ['resources/js/**/*.{ts,vue}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            'vue/multi-word-component-names': 'off',
        },
    },
);
