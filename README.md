gardr-core-plugin
=================

The PluginApi and pluginHandler used for both host and ext side plugin functionality. It has no dependencies to Garðr or
any other libraries.

To make plugins decoupled from the Garðr-code we have plugins as a
[pub-sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern). They are triggered syncronously, so plugins
can change the object that is passed along. In Garðr we use event names like: "{object}:{event}". For instance
"params:parsed" is triggered right after we've parsed the parameters from the URL in gardr-ext. The params object is
passed as the event data. If a plugin needs to change the script URL before it's written, it can just change the value
of `params.url`. Also "item:afterrender" is triggered after an item (banner) has finished loading, and the
item object is passed as the event data.

This module exposes two objects:

    var pluginCore = require('gardr-plugin-core');
    pluginCore.PluginApi; // the API-object constructor
    pluginCore.pluginHandler; // used to register and initialize plugins

It works by exposing a metod that pass plugins to pluginHandler.register. Then call pluginHandler.initPlugins with a new
instance of PluginApi and the options object (if they need it).

    var pluginApi;

    module.exports = {
        plugin: function (pluginFn) {
            pluginCore.pluginHandler.register(pluginFn);
        },

        init: function (options) {
            pluginApi = new pluginCore.PluginApi();
            pluginCore.pluginHandler.initPlugins(pluginApi, options);
        }
    };

Plugin functions have two parameters; pluginApi and options (same options as above).

    module.exports = function (pluginApi, options) {
        // Could check options for plugin configuration or read/change the main module´s options

        pluginApi.on('eventname', function (obj) {
            obj.foo = 'bar';
        });
    };

To trigger events:

    var obj = {foo: null};
    pluginApi.trigger('eventname', obj);
    console.log( obj.foo ); // 'foo'
