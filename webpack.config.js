const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { buildEntries, buildPlugins } = require("./scripts/build-path.js");

async function buildConfig() {
  const plugins = await buildPlugins();
  const entries = buildEntries();

  return {
    mode: "none",
    entry: { ...entries },
    output: {
      globalObject: "self",
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
      },
    },
    plugins: [
      ...plugins,
      new CopyWebpackPlugin({
        patterns: [
          { from: "./src/public", to: "assets", noErrorOnMissing: true },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
    ],
    devtool: "eval-source-map",
    devServer: {
      static: path.join(__dirname, "dist"),
      hot: true,
    },
    resolve: {
      extensions: ["*", ".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(s(a|c)ss)$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.ts$/,
          exclude: /node_module/,
          use: "ts-loader",
        },
      ],
    },
  };
}

module.exports = buildConfig();
