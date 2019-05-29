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
                "add-module-exports"
            ]
        },
        "test": {
            presets: [
                [
                    "@babel/preset-env"
                ]
            ]
        }
    },
    plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-class-properties"
    ]
}