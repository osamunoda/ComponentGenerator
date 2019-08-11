module.exports = {
    mode: 'production',
    entry: './src/main.ts', //ファイルをまとめる際のエントリーポイント
    output: {
        path: __dirname,
        filename: 'public/bundle.js' //まとめた結果出力されるファイル名
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'] //拡張子がtsだったらTypescirptでコンパイルする
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader', //ts-loader使うよ
                //include: "/Person"
            },
            {
                test: /\.css$/,
                /*loader: 普通はこの形で。順番も大事　*/
                /*use: ['style-loader', 'css-loader'] //ts-loader使うよ*/
                //CSS moduleを使い、component-scopedなCSSを生成したい場合はStep1:まずstyle-loader適用
                use: ['style-loader', 'css-loader?modules=false']
                //include: __dirname + "/container",
                //options: { modules: true }

            },

            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    }
}