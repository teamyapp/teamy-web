const viteTsconfig = require('vite-tsconfig-paths').default;
const { mergeConfig } = require('vite');
const childProcess = require('child_process');

const gitShortCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

const gitLongCommitHash = childProcess
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

module.exports = {
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/preset-create-react-app',
    ],
    staticDirs: ['../public'],
    core: {
        builder: '@storybook/builder-vite', // 👈 The builder enabled here.
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            plugins: [viteTsconfig()],
            define: {
                GIT_SHORT_COMMIT_HASH: JSON.stringify(gitShortCommitHash),
                GIT_LONG_COMMIT_HASH: JSON.stringify(gitLongCommitHash),
            },
        });
    },
};
