// eslint-config-next 16 ships a native ESLint 9 flat-config array directly
// (no more legacy .eslintrc string presets) — routing it through
// @eslint/eslintrc's FlatCompat, the old bridge for pre-flat configs, chokes
// on that shape. Importing the array itself is now the correct — and
// simpler — approach.
import nextConfig from 'eslint-config-next';

const eslintConfig = [...nextConfig, { ignores: ['.next/**', 'node_modules/**'] }];

export default eslintConfig;
