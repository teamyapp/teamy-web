const CracoEsbuildPlugin = require('craco-esbuild');
const CracoAlias = require('craco-alias');
const { DefinePlugin } = require('webpack');
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
    webpack: {
        plugins: [
            new DefinePlugin({
                'process.env.variables': JSON.stringify({
                    GIT_SHORT_COMMIT_HASH: gitShortCommitHash,
                    GIT_LONG_COMMIT_HASH: gitLongCommitHash,
                }),
            }),
        ],
        configure: (webpackConfig) => {
            return webpackConfig;
        },
    },
    plugins: [
        {
            plugin: CracoAlias,
            options: {
                source: 'tsconfig',
                baseUrl: './src',
                tsConfigPath: './tsconfig.path.json'
            },
        },
        {
            plugin: CracoEsbuildPlugin,
            options: {
                esbuildLoaderOptions: {
                    loader: 'tsx',
                    target: 'es2018',
                },
                esbuildMinimizerOptions: {
                    target: 'es2018',
                    css: true,
                },
            },
        },
    ],
};
