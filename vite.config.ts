import react from '@vitejs/plugin-react';
import childProcess from 'child_process';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const gitShortCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

const gitLongCommitHash = childProcess
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

console.log(gitLongCommitHash, gitShortCommitHash);

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'build',
    },
    plugins: [react(), tsconfigPaths()],
    define: {
        GIT_SHORT_COMMIT_HASH: JSON.stringify(gitShortCommitHash),
        GIT_LONG_COMMIT_HASH: JSON.stringify(gitLongCommitHash),
    },
});
