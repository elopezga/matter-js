var Creator = {};

module.exports = Creator;


var Engine = require('../core/Engine');
var World = require('../body/World');
var Bodies = require('../factory/Bodies');
var Render = require('../render/Render');
var RenderDom = require('../render/RenderDom');
var Runner = require('../core/Runner');


(function() {
    Creator.init = function(options){
        var engine = Engine.create();
        var runner = Runner.create();
        Runner.run(runner, engine);

        var renderer = RenderDom.create({
            engine: engine
        });

        var creater = {};

        return creater;
    }
});