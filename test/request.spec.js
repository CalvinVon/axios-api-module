import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ApiModule from '../src';
import utils from './utils';

chai.use(chaiAsPromised);
chai.should();

describe('request by baseConfig', () => {

    let config, apiModule, apiMapper;

    beforeEach('Setup ApiModule', () => {
        config = {
            baseURL: 'http://localhost:1111'
        };
        apiModule = new ApiModule({
            baseConfig: config,
            module: false,
            apiMetas: {
                test: {
                    url: '/api/test',
                    method: 'post'
                }
            }
        });

        apiMapper = apiModule.getInstance();
    });

    it('axios should get be configured right', () => {
        const axios = apiModule.getAxios();
        expect(axios.defaults).to.have.contain(config);
    });

    it('server should get right data package', done => {
        const postData = {
            body: {
                a: 1,
                b: 2
            }
        };
        const server = utils.createServer(1111, req => {
            let rawData = '';
            req.on('data', chunk => rawData += chunk);
            req.on('end', () => {
                server.on('close', done);
                server.close();
                const data = JSON.parse(rawData);
                expect(data).to.be.deep.eq(postData.body);
            });
        });
        server.on('listening', () => {
            apiMapper.test(postData);
        });
    });
});

describe('api meta', () => {
    it('test parameter mode url', done => {
        const apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:1111'
            },
            module: false,
            apiMetas: {
                test: {
                    url: '/api/{id}/:time/info',
                    method: 'post'
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        const id = 123;
        const time = Date.now();

        const server = utils.createServer(1111, req => {
            server.on('close', done);
            expect(req.url).to.be.eq(`/api/${id}/${time}/info?o=calvin&v=von`);
            server.close();
        });
        server.on('listening', () => {

            apiMapper.test({
                params: {
                    id,
                    time
                },
                query: {
                    o: 'calvin',
                    v: 'von'
                }
            });
        })
    });

    it('api mapper option', done => {
        const apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:1111'
            },
            module: false,
            apiMetas: {
                test: {
                    url: '/api/info',
                    method: 'post'
                }
            }
        });
        const apiMapper = apiModule.getInstance();
        const server = utils.createServer(2222, req => {
            let rawData = '';
            req.on('data', chunk => rawData += chunk);
            req.on('end', () => {
                server.on('close', done);
                server.close();
                expect(rawData).to.be.eq("{\"a\":1,\"b\":2}");
            });
        });
        server.on('listening', () => {
            apiMapper.test({
                body: {
                    a: 1,
                    b: 2
                }
            }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    baseURL: 'http://localhost:2222'
                });
        })
    });
});


describe('cancellation', () => {
    let server;
    before('Setup server', done => {
        server = utils.createServer(1111);
        server.on('listening', done);
    });

    after('Stop and clean server', done => {
        server.on('close', done);
        server.close();
        server = null;
    });

    it('request cancellation', () => {
        const apiModule = new ApiModule({
            baseConfig: {
                baseURL: 'http://localhost:1111',
                timeout: 10000
            },
            module: false,
            apiMetas: {
                test: {
                    url: '/api/info',
                    method: 'get'
                }
            }
        });

        const apiMapper = apiModule.getInstance();
        const cancelSource = apiModule.generateCancellationSource();

        const request = apiMapper.test(
            null,
            {
                cancelToken: cancelSource.token
            }
        );
        cancelSource.cancel('Canceled by the user');
        return request.should.rejectedWith('Canceled by the user');
    });
});