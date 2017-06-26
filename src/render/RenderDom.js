var RenderDom = {}

module.exports = RenderDom;

var Common = require('../core/Common');
var Composite = require('../body/Composite');
var Events = require('../core/Events');
var Render = require('../render/Render');

(function() {

    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (typeof window !== 'undefined'){
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                    || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
                                    || function(callback){ window.setTimeout(function(){callback(Common.now())}, 1000 / 60);};
        
        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                    || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }

    RenderDom.create = function(options){
        var defaults = {
            engine: null,
            element: window,
            controller: RenderDom,
            frameRequestId: null,
            options: {

            }
        }

        /*
        try{
            if(!options){
                throw (new Error('No engine was specified. Create an options object and specify the engine with the engine property.'));
            }

            if(!options.engine){
                throw (new Error('No engine was specified. Create an options object and specify the engine with the engine property.'));
            }
        }catch(e){
            console.log(`${e.name}: ${e.message}`);
            return;
        }*/

        var engine = options.engine;

        var render = Common.extend(defaults, options);

        var DOMVIEW = {};
        DOMVIEW.width = window.innerWidth;
        DOMVIEW.height = window.innerHeight;
        DOMVIEW.aspectRatio = DOMVIEW.width/DOMVIEW.height;
        DOMVIEW.center = {x: DOMVIEW.width/2, y: DOMVIEW.height/2};
        DOMVIEW.worldScale = 0.1
        DOMVIEW.worldToViewMap = function(point){
            return {
                x: DOMVIEW.width * (point.x/(DOMVIEW.width * DOMVIEW.worldScale)),
                y: DOMVIEW.height * (point.y/(DOMVIEW.height * DOMVIEW.worldScale))
            };
        }

        var MATTERWORLD = {};
        MATTERWORLD.width = DOMVIEW.width * DOMVIEW.worldScale;
        MATTERWORLD.height = DOMVIEW.height * DOMVIEW.worldScale;
        MATTERWORLD.center = {x: MATTERWORLD.width/2, y: MATTERWORLD.height/2};
        MATTERWORLD.viewToWoldMap = function(point){
            return {
                x: MATTERWORLD.width * (point.x/DOMVIEW.width),
                y: MATTERWORLD.height * (point.y/DOMVIEW.height)
            }
        }

        var debugRender = Render.create({
            element: document.querySelector('#debug'),
            engine: engine,
            options: {
                    width: MATTERWORLD.width,
                    height: MATTERWORLD.height,
                    background: '#fafafa',
                    wireframeBackground: '#222',
                    hasBounds: false,
                    enabled: true,
                    wireframes: true,
                    showSleeping: true,
                    showDebug: false,
                    showBroadphase: false,
                    showBounds: false,
                    showVelocity: false,
                    showCollisions: false,
                    showAxes: false,
                    showPositions: false,
                    showAngleIndicator: false,
                    showIds: false,
                    showShadows: false
            }
        });
        console.log(debugRender);
        Render.run(debugRender);

        render.DOMVIEW = DOMVIEW;
        render.MATTERWORLD = MATTERWORLD;
        render.DebugRender = debugRender;

        return render;
    }

    RenderDom.run = function(render){
        (function loop(time){
            render.frameRequestId = _requestAnimationFrame(loop);
            RenderDom.world(render);
        })();
    }

    RenderDom.stop = function(render){
        _cancelAnimationFrame(render.frameRequestId);
    }

    RenderDom.world = function(render){
        var engine = render.engine,
        world = engine.world,
        allBodies = Composite.allBodies(world),
        allConstraints = Composite.allConstraints(world),
        domBodies = document.querySelectorAll('[matter-id]');


        var event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(render, 'beforeRender', event);

        // TODO bounds if specified

        RenderDom.bodies(render, domBodies);
    }

    /**
     * Map Dom view elements position to matter world bodys position
     */
    RenderDom.bodies = function(render, bodies, context){
        var c = context,
            engine = render.engine,
            world = engine.world,
            options = render.options,
            matterBodies = Composite.allBodies(world),
            domBody;

        for(var i=0; i<bodies.length; i++){
            domBody = bodies[i];
            var matterBody = null;

            for(var j=0; j<matterBodies.length; j++){
                if(domBody.hasAttribute('matter-id') && matterBodies[j].id == domBody.getAttribute('matter-id')){
                    matterBody = matterBodies[j];
                    break;
                }
            }

            if(!matterBody){
                continue;
            }

            var bodyWorldPoint = renderer.DOMVIEW.worldToViewMap({x: matterBody.position.x, y: matterBody.position.y});
            var bodyViewOffset = {x: domBody.offsetWidth/2, y: domBody.offsetHeight/2};
            domBody.style.position = "absolute";
            domBody.style.transform = `translate(${bodyWorldPoint.x-bodyViewOffset.x}px, ${bodyWorldPoint.y-bodyViewOffset.y}px)`;
            domBody.style.transform += `rotate(${matterBody.angle}rad)`;
        }
    }

})();