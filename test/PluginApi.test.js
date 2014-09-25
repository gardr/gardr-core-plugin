/*jshint expr: true, nonew: false*/
var PluginApi = require('../lib/PluginApi.js'),
          xde = require('cross-domain-events'),
          api;

describe('PluginApi', function () {

    beforeEach(function () {
        api = new PluginApi();
    });

    afterEach(function () {
        api._reset();
    });

    describe('constructor', function () {

        it('should not throw if no arguments', function () {
            expect(function () {
                new PluginApi();
            }).not.to.throw();
        });
    });

    describe('events', function () {

        it('should exist', function () {
            expect(api.on).to.exist;
            expect(api.trigger).to.exist;
        });

        it('should allow adding listener', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            expect(spy).to.not.have.been.called;
        });

        it('should trigger listeners', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            api.trigger('test');
            expect(spy).to.have.been.calledOnce;
        });

        it('should pass arguments from trigger to the listeners', function () {
            var spy = sinon.spy();
            api.on('test', spy);
            api.trigger('test', 1, 2, 3);
            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        it('should allow multiple listeners', function () {
            var spy = sinon.spy();
            var spy2 = sinon.spy();
            api.on('test', spy);
            api.on('test', spy2);
            api.trigger('test');
            expect(spy).to.have.been.calledOnce;
            expect(spy2).to.have.been.calledOnce;
        });

        it('should allow triggering events without listeners', function () {
            expect(function () {
                api.trigger('foo');
            }).not.to.throw();
        });
    });

    describe('reqres', function () {

        describe('end-to-end', function () {
            var evtName = 'yoer:bar';
            var reqData = {fooInt : 1337};

            it('should call request.callback with proper params when there is a responder', function (done) {
                callRespondTo(api, evtName);
                callRequest(api, evtName, reqData, 1338, done);
            });
        });
    });
});


function callRespondTo (api, evtName) {
    api.reqres.respondTo(evtName, onXdeCb);

    function onXdeCb (evt, commCb) {
        var requestData = evt.data;
        var result = requestData.fooInt + 1;
        commCb({fooIntResult : result});
    }
}

function callRequest (api, evtName, reqData, expectedResult, done) {
    api.reqres.request(window, evtName, reqData, onXdeCb);

    function onXdeCb (evt) {
        var responseData = evt.data;
        expect(responseData.fooIntResult).to.equal(expectedResult);
        done();
    }
}
