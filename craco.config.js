const CracoSwcPlugin = require('craco-swc');
const { DefinePlugin } = require("webpack");
const childProcess = require('child_process');

const gitShortCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

const gitLongCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
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
            })
        ],
        configure: (webpackConfig) => {
            return webpackConfig;
        },
    },
    plugins: [
        {
            plugin: CracoSwcPlugin,
            options: {
                swcLoaderOptions: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            dynamicImport: true,
                        },
                        target: 'es5',
                        loose: false,
                        externalHelpers: true,
                        keepClassNames: false,
                    },
                },
            },
        },
    ],
};
