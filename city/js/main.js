var normalCity = function(){
	var updateFcts	= [];
	var  renderer,  controls;
	var prevTime = performance.now();
	this.init = function(){
        scene = new THREE.Scene();
		scene.fog	= new THREE.FogExp2( 0xd0e0f0, 0.0025 );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 3000)
		camera.position.y	= 80;

		var light	= new THREE.HemisphereLight( 0xfffff0, 0x101020, 1.25 );
		light.position.set( 0.75, 1, 0.25 );
		scene.add( light );

		var material	= new THREE.MeshBasicMaterial({ color: 0x101018 })
		var geometry	= new THREE.PlaneGeometry( 2000, 2000 )
		var plane	= new THREE.Mesh( geometry, material );
		plane.rotation.x= - 90 * Math.PI / 180;
		scene.add( plane );

		var axes = new THREE.AxesHelper( 100);
        // scene.add(axes);

		var city	= new THREE.ProceduralCity(renderer)
		scene.add(city)

	    controls = new THREE.FirstPersonControls( camera, renderer.domElement );
		controls.movementSpeed	= 20;
		controls.lookSpeed	= 0.05;
		controls.lookVertical	= false;
		animate();
	};

	function animate() {
		requestAnimationFrame( animate );
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;
		prevTime = time;
		controls.update(delta);
		render();
	};

	function render() {
		// stats.update();
		renderer.render( scene, camera );
	};

}

var _normalCity = new normalCity();
_normalCity.init();

