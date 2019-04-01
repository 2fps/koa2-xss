const xss = require('xss');
const params = ['get', 'delete'];

let config = {
    whiteList: [],
    stripIgnoreTag: false, // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ["<>"],
};

module.exports = function (options) {
    config = Object.assign({}, config, options);

    return async function (ctx, next) {
        let data = {};
        if (~params.indexOf( ctx.method.toLowerCase() )) {
            // 检验参数
            data = ctx.query;
        } else {
            data = ctx.request.body;
        }
        data = check(data);

        await next();
    };
};

function check(data) {
    for (let key in data) {
        let val = data[ key ];

        if (val.constructor === Object || val.constructor === Array) {
            check(val);
        } else {
            if (typeof val === 'string') {
                val = xss(val, config);
            }
            // 常量类型
            data[ key ] = val;
        }
    }

    return data;
}