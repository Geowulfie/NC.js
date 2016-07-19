/* L. Juracz Copyright @2014
 * Manage the view control
 * Modified by G. Hemingway @2015
 */
"use strict";


let TrackballControls = require('./trackball_controls');

/********************************* Helper Functions ********************************/

module.exports = function ViewerControls( options ) {
    let trackballControl = null,
        camera = options.camera,
        canvas = options.canvas,
        viewDistance = options.viewDistance || 13000,
        viewAngles = options.viewAngles || new THREE.Euler( 0, 0 ,0),
        referenceOrientation = new THREE.Vector3( 0, 0, 1 );

    function init() {
        trackballControl = new THREE.TrackballControls( camera, canvas );
        trackballControl.rotateSpeed = 1.0;
        trackballControl.zoomSpeed = 1.2;
        trackballControl.panSpeed = 0.8;
        trackballControl.noZoom = false;
        trackballControl.noPan = false;
        trackballControl.staticMoving = true;
        trackballControl.dynamicDampingFactor = 0.3;
        // Initial position
        trackballControl.up0.set( 0, 1, 0 );
        trackballControl.position0 = referenceOrientation.clone().applyEuler( viewAngles  );
        trackballControl.position0.multiplyScalar( -viewDistance );
        trackballControl.reset();
        trackballControl.setRotationFromEuler = function (euler, opt_upVector) {
            let distance = camera.position.distanceTo(this.target);
            this.target0.copy(this.target);
            this.position0.copy(referenceOrientation).
            applyEuler(euler).
            multiplyScalar(-distance).
            add(this.target);
            if (typeof(opt_upVector) !== 'undefined') {
                this.up0.copy(opt_upVector);
            }
            this.reset();
        };
    }
    if ( camera !== undefined && camera !== null ) {
        init();
    } else {
        throw( new Error("No camera specified") );
    }
    return trackballControl;
};