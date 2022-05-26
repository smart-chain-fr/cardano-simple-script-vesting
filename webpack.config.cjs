const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./src/index.ts",
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "public"),
  },
  plugins: [new NodePolyfillPlugin()],
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
    layers: true, // optional, with some bundlers/frameworks it doesn't work without
  },
};
