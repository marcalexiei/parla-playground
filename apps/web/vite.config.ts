import { parla } from '@parlajs/compiler/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [parla(), react()],
});
