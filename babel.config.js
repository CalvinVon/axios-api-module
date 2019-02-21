module.exports = {
    env: {
        "es": {
            presets: [
                [
                    "@babel/preset-env",
                    {
                        useBuiltIns: false,
                        modules: false
                    }
                ]
            ],
            plugins: [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties"
            ]
        },
        "umd": {
            presets: [
                [
                    "@babel/preset-env",
                    {
                        useBuiltIns: false,
                        modules: "umd"
                    }
                ]
            ],
            plugins: [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties"
            ]
        }
    }
}