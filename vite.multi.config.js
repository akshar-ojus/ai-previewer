
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      base: './', // Essential for GitHub Pages relative links
      build: {
        rollupOptions: {
          input: {"UserCard":"/home/akshar/Documents/ai-previewer/preview-UserCard.html","SmartLink":"/home/akshar/Documents/ai-previewer/preview-SmartLink.html","main":"/home/akshar/Documents/ai-previewer/index.html"}
        }
      }
    });
  