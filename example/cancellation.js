const ApiModule = require("../lib");

const apiMod = new ApiModule({
    module: false,
    apiMetas: {
        test: {
            method: 'get',
            url: '/api/stock/list',
            name: '获取股票列表',
        }
    },
});

const api = apiMod.getInstance();
const cancelSourceA = api.$module.generateCancellationSource();
const cancelSourceB = api.$module.generateCancellationSource();

// send a request
api.test({
    query: {
        a: 123
    },
}, {
    cancelToken: cancelSourceA.token
});

api.test({
    query: {
        b: 321
    },
}, {
    cancelToken: cancelSourceB.token
});

cancelSourceA.cancel('Canceled by the user');