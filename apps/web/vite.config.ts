import { parla } from '@parlajs/compiler/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const NAMESPACE_MODULE = /\/src\/parla\/namespaces\/[^/]+\.js$/;
const LOADER = /"(?<locale>[^"]+)": \(\) => import\((?<path>"[^"]+")\)/g;

/** Routes each generated chunk loader through `globalThis.__parlaChunk`, which delays and logs it. */
function chunkLog(): Plugin {
  return {
    name: 'playground:chunk-log',
    transform(code, id) {
      if (!NAMESPACE_MODULE.test(id.split('?')[0] ?? id)) {
        return null;
      }
      const name = JSON.stringify(/name: "(?<name>[^"]+)"/.exec(code)?.groups?.name);
      return code.replaceAll(
        LOADER,
        `"$<locale>": () => (globalThis.__parlaChunk ?? ((n, l, f) => f()))(${name}, "$<locale>", () => import($<path>))`,
      );
    },
  };
}

export default defineConfig({
  // Relative, so the build works under any GitHub Pages path; routes live in the hash.
  base: './',
  plugins: [parla(), chunkLog(), react()],
});
