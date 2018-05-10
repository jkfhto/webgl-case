var Sketch_render = function(){
	var container, stats;
	var camera, scene, renderer;
	var composeCamera, composeScene;
	var depthFbo, normalFbo, sketchFbo;
	var materialDepth, materialNormal;
	var cameraNear = 1.0, cameraFar = 50.0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	this.init = function() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, cameraNear, cameraFar );
		camera.position.z = 30;
		controls = new THREE.OrbitControls( camera );
		controls.target.set( 0, -0.2, -0.2 );
		controls.update();

		// scene

		scene = new THREE.Scene();

		var ambient = new THREE.AmbientLight( 0x444444 );
		scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 0, 0, 1 ).normalize();
		scene.add( directionalLight );
		var loader = new THREE.JSONLoader();
	    var Material = new THREE.MeshBasicMaterial({
	        map: new THREE.TextureLoader().load("textures/room_baked.png")
	    });
	    var bakedshadow = new THREE.TextureLoader().load('textures/room_baked.png');
	    var hatch0 = new THREE.TextureLoader().load('textures/hatch_3.jpg');
	    var hatch1 = new THREE.TextureLoader().load('textures/hatch_4.jpg');
	    var hatch2 = new THREE.TextureLoader().load('textures/hatch_5.jpg');
	    bakedshadow.wrapS= bakedshadow.wrapT =THREE.RepeatWrapping;
	    hatch0.wrapS= hatch0.wrapT =THREE.RepeatWrapping;
	    hatch1.wrapS= hatch1.wrapT =THREE.RepeatWrapping;
	    hatch2.wrapS= hatch2.wrapT =THREE.RepeatWrapping;
	    // bakedshadow.repeat = hatch0.repeat = hatch1.repeat = hatch2.repeat = new THREE.Vector2( 10, 10 );
	    var sketchUniforms = {
			bakedshadow:{
				type: 't',
		        value: bakedshadow
			},
		    hatch0:{
		    	type: 't',
		        value: hatch0
		    },
		    hatch1:{
		    	type: 't',
		        value: hatch1
		    },
		    hatch2:{
		    	type: 't',
		        value:hatch2
		    }
	    };
	    sketchShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: sketchUniforms,
	        vertexShader: document.getElementById('sketch-vert').textContent,
	        fragmentShader: document.getElementById('sketch-frag').textContent
	    });
		// load a resource
		loader.load(
			// resource URL
			'models/room.json',

			// onLoad callback
			function ( geometry, materials ) {
				// var material = materials[ 0 ];
				var object = new THREE.Mesh( geometry, sketchShaderMaterial);
				object.position.y = -8;
				var vertexNormalsHelper = new THREE.VertexNormalsHelper( object, 1 );
				// object.add( vertexNormalsHelper );
				var faceNormalsHelper = new THREE.FaceNormalsHelper( object, 1 );
				// object.add( faceNormalsHelper );
				scene.add( object );

			},

			// onProgress callback
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},

			// onError callback
			function( err ) {
				console.log( 'An error happened' );
			}
		);
		var uniforms = {
			cameraNear: {
				type: "f",
				value: cameraNear
			},
			cameraFar: {
				type: "f",
				value: cameraFar
			},
	    };
	    var  ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('depth-vert').textContent,
	        fragmentShader: document.getElementById('depth-frag').textContent
	    });
		materialDepth = ShaderMaterial;//深度
		var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		depthFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

		materialNormal = new THREE.MeshNormalMaterial();//法线
		var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		normalFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	    var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		sketchFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

		composeCamera = new THREE.OrthographicCamera(-windowHalfX, windowHalfX, windowHalfY, -windowHalfY, -10, 10);
		composeScene = new THREE.Scene();
		var composePlaneGeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);//最终效果渲染平面
		var composeUniforms = {
	        uResolution: {
				type :"v2",
	            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
	        },
			depthtexture: {
				value: depthFbo.texture
			},
			normaltexture: {
				value: normalFbo.texture
			},
			hatchtexture: {
				value: sketchFbo.texture
			}
	    };
	    var  composeShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: composeUniforms,
	        vertexShader: document.getElementById('outline-vert').textContent,
	        fragmentShader: document.getElementById('outline-frag2').textContent
	    });
		var composeMaterial = new THREE.MeshBasicMaterial({
	        map: depthFbo.texture
	    });
		composePlaneMesh = new THREE.Mesh(composePlaneGeometry, composeShaderMaterial);
		composeScene.add(composePlaneMesh);

		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
		animate();

	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//

	function animate() {

		requestAnimationFrame( animate );
		render();

	}

	function render() {

		scene.overrideMaterial = materialDepth;
		renderer.render( scene, camera, depthFbo, true );//使用深度材质渲染场景到帧缓存 得到深度贴图
		scene.overrideMaterial = materialNormal;
		renderer.render( scene, camera, normalFbo, true );//使用法线材质渲染场景到帧缓存 得到法线贴图
	    // scene.overrideMaterial = sketchShaderMaterial;
	    scene.overrideMaterial = null;
	    renderer.render( scene, camera, sketchFbo, true );//渲染素描效果的场景到帧缓存
	    scene.overrideMaterial = null;
		// renderer.render( scene, camera );
		renderer.render( composeScene, composeCamera );//深度贴图法线贴图基于图像处理进行描边 将描边的场景与素描效果的场景合成最终的场景效果

	}
}
var _Sketch_render = new Sketch_render();
_Sketch_render.init();

