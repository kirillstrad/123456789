import {defineConfig} from 'vite';export default defineConfig({base:'./',server:{host:'127.0.0.1',port:5173},build:{outDir:'dist/web',emptyOutDir:true,target:'es2022'}});
