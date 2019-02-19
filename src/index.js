import ApiModule from "./main";

const apiModule = new ApiModule({
    apiMetas: {
        aaa: {
            method: 'GET',
            url: '/api/stock/list',
            name: '获取股票列表',
        }
    }
});

apiModule.registeForeRequestMiddleWare((apiMeta, data, next) => {
    console.log(apiMeta)
    console.log(data)
    next();
})

apiModule.registeFallbackMiddleWare((apiMeta, error, next) => {
    console.log(apiMeta)
    console.log(error)
    next(error);
})

console.log(apiModule)
console.log(apiModule.getInstance())