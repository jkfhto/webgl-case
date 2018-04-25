var Photoshop_blend = function(){
	var container;
	var scene, camera, renderer, stats, controls;
	var uniforms, ShaderMaterial;
	var aspect = window.innerWidth /window.innerHeight;
	var scope = this;
	this.init = function() {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	    camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,10000);
	    camera.position.z = 220;

	    scene = new THREE.Scene();

	    var geometry = new THREE.PlaneBufferGeometry(200, 200);
	    var imouse = new THREE.Vector2();
	    window.addEventListener("mousemove", function(event) {
	      imouse.x = event.clientX;
	      imouse.y = event.clientY;
	    })

	    uniforms = {
	      texture1:   { value: new THREE.TextureLoader().load( "css/pic1.jpg" ) },
	      texture2:   { value: new THREE.TextureLoader().load( "css/pic2.jpg" ) },
	      blendNum: {
	        type: "i",
	        value: 1
	      },
	    };

	    ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });

	    var mesh = new THREE.Mesh(geometry, ShaderMaterial);
	    // mesh.rotation.y = THREE.Math.degToRad(180/2);
	    scene.add(mesh);

	    renderer = new THREE.WebGLRenderer();
	    renderer.setPixelRatio(window.devicePixelRatio);

	    document.body.appendChild(renderer.domElement);
        // controls = new THREE.OrbitControls(camera,renderer.domElement);
	    this.onWindowResize();
	    window.addEventListener('resize', this.onWindowResize, false);
	    this.animate();
	    this.addGui();
    };

    this.onWindowResize = function(event) {
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	    renderer.setSize(window.innerWidth, window.innerHeight);
	};

	this.animate = function() {
	    requestAnimationFrame(scope.animate);
	    scope.render();
    };

	this.render = function() {
		stats.update();
		// controls.update();
	    renderer.render(scene, camera);
	};

	this.addGui = function(){
		var API = {
					'切换blend'    	: 'multiply',
				};
		var gui = new dat.GUI();
        var blend_arr=['multiply', 'colorBurn', 'linearBurn', 'darkerColor', 'lighten','screen', 'colorDodge', 'linearDodge', 'lighterColor', 'overlay', 'softLight', 'hardLight', 'vividLight', 'linearLight', 'pinLight', 'hardMix', 'difference', 'exclusion', 'subtract', 'divide', 'hue', 'color', 'saturation', 'luminosity']
		gui.add(API, '切换blend', blend_arr).onChange( function(val) {
			for(var i=0; i<blend_arr.length;i++){
				if(blend_arr[i] === val){

	                uniforms.blendNum.value = i+1;

				}
			}
		} );;

	};
}

var _Photoshop_blend = new Photoshop_blend();
_Photoshop_blend.init();