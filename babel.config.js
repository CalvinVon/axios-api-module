module.exports = {
    presets: [
        [
            "@babel/preset-env",
            // {
            //     targets: {
            //         node: 6
            //     }
            // }
        ]
    ],
    plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-class-properties"
    ]
}