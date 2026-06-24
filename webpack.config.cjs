const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // Absolute public path ensures asset URLs (e.g. the PDF.js worker resolved
    // via `new URL(…, import.meta.url)`) are always correct regardless of which
    // sub-path Netlify serves the page from.
    publicPath: '/',
    // Workers and other emitted assets land in dist/assets/
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Emit pdf.worker.min.js (and any other pre-built worker files from
      // node_modules) as a standalone file so the browser can load it via a
      // URL rather than Webpack trying to re-bundle it.
      {
        test: /pdf\.worker(\.min)?\.js$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    // Serve the webpack output plus the static content pages (about / privacy /
    // terms / contact + pages.css, favicon.svg, og-image.png, .well-known) straight
    // from the repo so the footer links work in `npm run dev` exactly as they do on
    // Netlify in production.
    static: [
      { directory: path.join(__dirname, 'dist') },
      { directory: __dirname },
    ],
    // Clean URLs in dev: /about -> /about.html, etc. (mirrors the Netlify _redirects).
    // Requests that contain a dot, like /about.html or /favicon.svg, are served
    // directly and are NOT rewritten.
    historyApiFallback: {
      rewrites: [
        { from: /^\/about\/?$/, to: '/about.html' },
        { from: /^\/privacy\/?$/, to: '/privacy.html' },
        { from: /^\/terms\/?$/, to: '/terms.html' },
        { from: /^\/contact\/?$/, to: '/contact.html' },
      ],
    },
    compress: true,
    port: 9000,
    open: true,
  },
  resolve: {
    extensions: ['.js'],
  },
};
