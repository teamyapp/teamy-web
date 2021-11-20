const CracoSwcPlugin = require('craco-swc');

module.exports = {
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
