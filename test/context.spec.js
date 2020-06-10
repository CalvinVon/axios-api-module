import chai, { expect } from 'chai';
import ApiModule from '../src';



describe('context.metadataKeys', () => {
    it('single module', () => {
        const request = new ApiModule({
            metadatas: {
                interfaceA: {
                    name: 'interfaceA',
                    method: 'GET',
                    url: '/test'
                }
            },
            module: false
        }).getInstance().interfaceA;

        expect(request.context.metadataKeys).to.be.deep.equal(['interfaceA']);
    });

    it('multiple module', () => {
        const request = new ApiModule({
            metadatas: {
                modA: {
                    interface: {
                        name: 'modA',
                        method: 'GET',
                        url: '/test'
                    }
                }
            },
            module: true
        }).getInstance().modA.interface;

        expect(request.context.metadataKeys).to.be.deep.equal(['modA', 'interface']);
    });
});

describe('context should be reset in second calls', () => {

    it('data, error, response', () => {
        const apiMod = new ApiModule({
            metadatas: {
                interfaceA: {
                    name: 'interfaceA',
                    method: 'GET',
                    url: '/test'
                }
            },
            module: false
        });
        apiMod.useBefore((context, next) => {
            // set error on purpose
            context.setError('I am an Error occurred before real request');
            context.setResponse({ data: 123 });
            context.setAxiosOptions({ headers: { 'x-app': 1 } });
            next();
        });
        const request = apiMod.getInstance().interfaceA;

        // first request
        request();
        
        let collector = {};
        apiMod.useBefore((context, next) => {
            collector = {
                data: context.data,
                response: context.response,
                responseError: context.responseError,
                axiosOptions: context.axiosOptions,
            }
            next();
        });
        
        const secondData = {};
        request(secondData);

        expect(collector.data).to.be.equal(secondData);
        expect(collector.response).to.be.equal(null);
        expect(collector.responseError).to.be.equal(null);
        expect(collector.axiosOptions).to.be.deep.equal({});
        
    });
});