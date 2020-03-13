var path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'sass'),
        filename: 'index.js',
        sourceMapFilename: "index.js.map",
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     include: path.resolve(__dirname, 'src'),
            //     exclude: /(node_modules|bower_components)/,
            //     use: ['babel-loader', 'source-map-loader']
            // }, 
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            }, {
                test: /\.css$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader'
                ],
            },{
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }, {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-inline-loader'
                    }
                ]
            }
        ]
    },
    externals: {
        "@gisatcz/ptr-utils": "@gisatcz/ptr-utils",
        "@gisatcz/ptr-core": "@gisatcz/ptr-core",
        "@gisatcz/ptr-atoms": "@gisatcz/ptr-atoms",
        "@gisatcz/ptr-locales": "@gisatcz/ptr-locales",
        "classnames": "classnames",
        "prop-types": "prop-types",
        "lodash": "lodash",
        "react": "react",
        "react-dom": "react-dom",
    }
};