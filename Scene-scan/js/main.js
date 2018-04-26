var Scene_scan = function(){
	var container, stats;
	var camera, scene, renderer, controls, uniforms;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var near = 1,far = 2000;
	this.init = function() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, near, far );
		camera.position.y = 335;
		camera.position.z = 720;
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
		var onError = function ( xhr ) { };
		var texture = new THREE.TextureLoader().load( 'mountain/ground_grass_3264_4062_Small.jpg' );
		uniforms = {
	        texture1:   { value: texture },
		    time: {
				type: "f",
				value: 0.0
			},
			near: {
				type: "f",
				value: near
			},
			far: {
				type: "f",
				value: far
			},
			_ScanWidth: {
				type: "f",
				value: 0.05
			},
			_ScanColor: {
				// type :"vec3",
	            value: new THREE.Vector3(1,1,0)
	        },

	    };
	    var  ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( 'mountain/' );
		mtlLoader.load( 'mount.blend1.mtl', function( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			materials.materials["Material.001"] = ShaderMaterial;//直接修改材质 材质相对于原材质可能会丢失部分细节
			objLoader.setMaterials( materials );
			objLoader.setPath( 'mountain/' );
			objLoader.load( 'mount.blend1.obj', function ( object ) {
				object.scale.set(100,100,100)
				scene.add( object );
			}, onProgress, onError );
		});
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
		var time = Date.now();
		var looptime = 20 * 100;//设置速度
		var t = ( time % looptime ) / looptime;//限制在[0,1]范围
		uniforms.time.value = t;
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
