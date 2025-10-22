const path = require("path");

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "umd",
            name: "NXTCM-COMPONENTS"
        },
        clean: {
            keep: /\.d\.ts$/, // Keep all .d.ts files
        },
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    externals: {
        react: "react",
        "react-dom": "react-dom"
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.module\.s?css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName: "[name]__[local]--[hash:base64:5]",
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.s?css$/,
                exclude: /\.module\.s?css$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ],
    },
    devServer: {
        static: "./public",
        hot: true,
        port: 4004
    },
    devtool: "source-map"
}