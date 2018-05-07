var Scene_scan = function(){
	var container, stats;
	var renderer, controls, uniforms;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var near = 1,far = 2000;
	this.init = function() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, near, far );
		camera.position.x = 50;
		camera.position.y = 20;
		stats = new Stats();
		document.body.appendChild(stats.dom);
		// scene
		scene = new THREE.Scene();
		var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
		scene.add( ambientLight );
		var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
		camera.add( pointLight );
		scene.add( camera );

		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) { console.log(xhr)};
		var texture = new THREE.TextureLoader().load( 'Farmhouse Maya 2016 Updated/Farmhouse Texture.jpg' );
		var loader = new THREE.OBJLoader( );
		loader.load( 'Farmhouse Maya 2016 Updated/farmhouse_obj.obj', function ( object ) {

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.material.map = texture;

				}

			} );

			object.position.y = - 5;
			scene.add( object );

		}, onProgress, onError );
		//
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );
		controls = new THREE.OrbitControls(camera,renderer.domElement);
		window.addEventListener( 'resize', onWindowResize, false );
		animate();
	};

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		render();
	};

	function render() {
		stats.update();
		renderer.render( scene, camera );
	};

    this.addGui=function(){
		var API = {
					'扫描网宽度-width'    	: 0.05,
					'扫描网颜色-color'    	: [255, 255, 0],
					'开启扫描'    	: true,
				};
		var gui = new dat.GUI();
		gui.addColor( API, '扫描网颜色-color' ).onChange( function(val) {
			    uniforms._ScanColor.value.x = val[0]/255;//转到着色器数值范围[0-1]
			    uniforms._ScanColor.value.y = val[1]/255;
			    uniforms._ScanColor.value.z = val[2]/255;
		} );

		gui.add( API, '扫描网宽度-width', 0.01, 0.1, .01 ).onChange( function(val) {
				uniforms._ScanWidth.value = val;
		} );

	}
}
var _Scene_scan = new Scene_scan();
_Scene_scan.init();
_Scene_scan.addGui();
