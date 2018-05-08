var X_ray = function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	var container, stats, controls;
	var camera, scene, renderer, light,uniforms,_mainobj;

	this.init = function() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 2000 );
		camera.position.set( 0, 20, 500 );

		controls = new THREE.OrbitControls( camera );
		controls.target.set( 0, -0.2, -0.2 );
		controls.update();

	    scene = new THREE.Scene();
		light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
		light.position.set( 0, 1, 0 );
		scene.add( light );

		// model
		this.load_Fence();

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.gammaOutput = true;
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

		// stats
		stats = new Stats();
		container.appendChild( stats.dom );
		animate();

	}

	function onProgress ( xhr ) {
		    var _div = document.getElementById("load_inf");
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				    _div.innerHTML="模型正在加载中"+percentComplete+ '%';
				if(percentComplete == 100){
					_div.style.display='none';
				}
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
	};

	function onError( xhr ) { console.log(xhr)};

	this.load_Fence = function () {
		var scope = this;
		var loader = new THREE.GLTFLoader();
		loader.load( 'css/fence/scene.gltf', function ( gltf ) {

			scene.add( gltf.scene );
			gltf.scene.position.y = -100;
			gltf.scene.scale.set(100,100,100);
			scope.load_Man();

		} );
	}

	this.load_Man = function(){
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( 'css/male02/' );
		var num =100;
		uniforms = {
	    texture1:   { value: null },
		    time: {
				type: "f",
				value: 0.0
			},
			_normalMatrix: {
				// type: "f",
				value: new THREE.Matrix3(),//法线矩阵
			},
			uResolution: {
		        type: "v2",
		        value: new THREE.Vector2(window.innerWidth,window.innerHeight)
		    },

	    };
	    var  ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });
		mtlLoader.load( 'male02_dds.mtl', function( materials ) {

			materials.preload();

			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( 'css/male02/' );
			objLoader.load( 'male02.obj', function ( object ) {
				var _object = new THREE.Object3D();
	            object.traverse( function ( child ) {
	            	_mainobj =object;

					if ( child.isMesh ) {
						    var _mesh = new THREE.Mesh(child.geometry.clone(),child.material.clone());
						    _object.add(_mesh);
						    child.material = ShaderMaterial;
	                        child.renderOrder = 10;//修改对象的renderOrder 默认会开启渲染排序 renderOrder不同 则按照renderOrder的升序排序 先渲染renderOrder比较小的Mesh对象
	                        num--;
						    child.material.depthFunc = THREE.GreaterEqualDepth;
						//  child.material.depthTest = false;
						    child.material.depthWrite = false;
						    // renderer.state.setCullFace(THREE.CullFaceFront);//开启剔除正面功能 

					}

				} );
				object.position.y = - 100;
				object.position.z = - 100;
				// object.material.depthFunc = THREE.GreaterEqualDepth;
				scene.add( object );
				_object.traverse( function ( child ) {

					if ( child.isMesh ) {
						    var _mesh = new THREE.Mesh(child.geometry.clone(),child.material.clone())
						   _object.add(_mesh);
	                        child.renderOrder = 20;//先渲染透视效果  再渲染正常部分 不然未遮挡的部分 透视效果的深度会与正常绘制的深度冲突 导致正常绘制的也会参数描边效果
						    child.material.depthFunc = THREE.LessEqualDepth;

					}

				} );
				_object.position.y = - 100;
				_object.position.z = - 100;
				scene.add( _object );

			}, onProgress, onError );

		});
	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//

	function animate() {
		_mainobj&&(_mainobj.matrixWorldNeedsUpdate = true);
	    _mainobj&&uniforms._normalMatrix.value.getNormalMatrix( _mainobj.matrixWorld );//更新法线矩阵
		requestAnimationFrame( animate );

		renderer.render( scene, camera );

		stats.update();

	}
}
var _X_ray = new X_ray();
_X_ray.init();

