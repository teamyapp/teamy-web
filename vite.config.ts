import react from '@vitejs/plugin-react-swc';
import * as childProcess from 'child_process';
// @ts-ignore
import dns from 'dns';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import buildInject from './vite-plugins/buildInject';

dns.setDefaultResultOrder('verbatim');

const gitShortCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

const gitLongCommitHash = childProcess
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

// https://vitejs.dev/config/
export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    return defineConfig({
        server: {
            port: 3000,
        },
        build: {
            outDir: 'build',
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    },
                },
            },
            sourcemap: JSON.parse(process.env.VITE_ENABLE_SOURCE_MAP),
        },
        plugins: [buildInject(), tsconfigPaths(), react()],
        define: {
            GIT_SHORT_COMMIT_HASH: JSON.stringify(gitShortCommitHash),
            GIT_LONG_COMMIT_HASH: JSON.stringify(gitLongCommitHash),
        },
    });
};
