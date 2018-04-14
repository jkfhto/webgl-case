var Shadertoy = function(){
	var container;
	var camera, scene, renderer, stats;
	var uniforms, ShaderMaterial;
	var aspect = window.innerWidth /window.innerHeight;
	var scope = this;
	this.init = function() {
		stats = new Stats();
		document.body.appendChild(stats.dom);

	    // camera = new THREE.Camera();
	    // camera = new THREE.OrthographicCamera( 0.5 * 600 * aspect / - 2, 0.5 * 600 * aspect / 2, 600 / 2, 600 / - 2, 1, 1000 );
	    camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,100);
	    camera.position.z = -5;

	    scene = new THREE.Scene();

	    var geometry = new THREE.PlaneBufferGeometry(20, 20);
	    var imouse = new THREE.Vector2();
	    window.addEventListener("mousemove", function(event) {
	      imouse.x = event.clientX;
	      imouse.y = event.clientY;
	    })

	    uniforms = {
	      resolution: {
	        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
	      },
	      uTime: {
	        type: "f",
	        value: 1.0
	      },
	      ushaderNum: {
	        type: "f",
	        value: 1.0
	      },
	      uResolution: {
	        type: "v2",
	        value: new THREE.Vector2()
	      },
	      uMouse: {
	        type: "v2",
	        value: imouse
	    }};

	    ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });

	    var mesh = new THREE.Mesh(geometry, ShaderMaterial);
	    mesh.rotation.y = THREE.Math.degToRad(180/2);
	    scene.add(mesh);

	    renderer = new THREE.WebGLRenderer();
	    renderer.setPixelRatio(window.devicePixelRatio);

	    document.body.appendChild(renderer.domElement);

	    this.onWindowResize();
	    window.addEventListener('resize', this.onWindowResize, false);
	    this.animate();
	    this.addGui();
    };

    this.onWindowResize = function(event) {
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	    // renderer.setSize( window.innerWidth, window.innerHeight );
	    renderer.setSize(window.innerWidth, window.innerHeight);
	    uniforms.uResolution.value.x = renderer.domElement.width;
	    uniforms.uResolution.value.y = renderer.domElement.height;
	};

	this.animate = function() {
	    requestAnimationFrame(scope.animate);
	    scope.render();
    };

	this.render = function() {
		stats.update();
	    uniforms.uTime.value += 0.025;
	    renderer.render(scene, camera);
	};

	this.addGui = function(){
		var API = {
					'切换shader'    	: 'shader1',
				};
		var gui = new dat.GUI();

		gui.add(API, '切换shader', [ 'shader1', 'shader2' ]).onChange( function(val) {
			if(val === "shader1"){
                uniforms.ushaderNum.value = 1.0;
			}else if(val === "shader2"){
                uniforms.ushaderNum.value = 2.0;
			}
			ShaderMaterial.needsUpdate = true;
		} );;

	    // $(".ac").css({"z-index":100})
	};
}

var _Shadertoy = new Shadertoy();
_Shadertoy.init();