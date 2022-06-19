const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  entry: "./src/renderer.tsx",
  devtool: "source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "react-native": "react-native-web",
      "react-native-svg": "react-native-svg-web",
    },
    modules: [path.resolve(__dirname, "./node_modules"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "macros",
              [
                "@babel/plugin-transform-runtime",
                {
                  regenerator: true,
                },
              ],
              isDevelopment && "react-refresh/babel",
            ].filter(Boolean),
            presets: ["@babel/preset-env", "@babel/react", "@babel/typescript"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg|png/,
        type: "asset/inline",
      },
    ],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [new ReactRefreshWebpackPlugin()],
  devServer: {
    static: {
      directory: path.join(__dirname, "src"),
    },
    port: 9000,
    hot: true,
  },
};
