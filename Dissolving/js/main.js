var Dissolving = function(){
	var container, stats;
	var camera1, scene, renderer, controls, uniforms;
	var openDissolving = false;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var near = 1,far = 2000;
	var looptime = 50 * 100;//设置速度
	var clock = new THREE.Clock();
	var timeScale = 1.1;
	var noiseTexture;
	this.init = function() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, near, far );
		// camera.position.y = 335;
		camera.position.z = 300;
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
		var onError = function ( xhr ) { };
		var texture = new THREE.TextureLoader().load( 'css/Bandit_Bruiser/BanditBruiserBody_Dif.bmp' );
		uniforms = {
	        texture1:   { value: texture },
	        noiseTexture:   { value: noiseTexture },
		    time: {
				type: "f",
				value: 0.0
			},
			uResolution: {
		        type: "v2",
		        value: new THREE.Vector2(window.innerWidth,window.innerHeight)
		    },
		    DissolvingColor: {
				// type :"vec3",
	            value: new THREE.Vector3(1,1,0)
	        },

	    };
	    var  ShaderMaterial = new THREE.ShaderMaterial({
	        uniforms: uniforms,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });
	    ShaderMaterial.transparent = true;//关键代码 开启混合 实现半透明效果
	    var texture2 = new THREE.TextureLoader().load( 'css/Bandit_Bruiser/BanditBruiserHead_Dif.bmp' );
	    uniforms2 = {
	        texture1:   { value: texture2 },
	        noiseTexture:   { value: noiseTexture },
		    time: {
				type: "f",
				value: 0.0
			},
			uResolution: {
		        type: "v2",
		        value: new THREE.Vector2(window.innerWidth,window.innerHeight)
		    },
		    DissolvingColor: {
				// type :"vec3",
	            value: new THREE.Vector3(1,1,0)
	        },

	    };
	    var  ShaderMaterial2 = new THREE.ShaderMaterial({
	        uniforms: uniforms2,
	        vertexShader: document.getElementById('vertexShader').textContent,
	        fragmentShader: document.getElementById('fragmentShader').textContent
	    });
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( 'css/Bandit_Bruiser/' );
		mtlLoader.load( 'Bandit_Bruiser.mtl', function( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			materials.materials["Mati_BruiserHead"] = ShaderMaterial2;
			materials.materials["Mati_BruiserBody"] = ShaderMaterial;//直接修改材质 材质相对于原材质可能会丢失部分细节
			objLoader.setMaterials( materials );
			objLoader.setPath( 'css/Bandit_Bruiser/' );
			objLoader.load( 'Bandit_Bruiser.obj', function ( object ) {
				// object.scale.set(100,100,100)
				scene.add( object );
				object.position.y = -100;
				object.rotation.y = -Math.PI/2;
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
		this.initTexture();
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
		if(openDissolving){
			var time = Date.now();
			// var time = ( 1 + Math.sin( 2 * clock.getElapsedTime() / Math.PI ) ) / 2;//t取值：0-1
			time = Math.sin(( time % looptime ) / looptime*Math.PI);//限制在0-1-0范围
			uniforms.time.value = time * timeScale;//关键代码 乘以timeScale 确保time值为1时  整个场景完全消融
			uniforms2.time.value = time * timeScale;
		}
		stats.update();
		renderer.render( scene, camera );
	};

	this.initTexture = function(){
		this.textures = [];
	    var loader = new THREE.TextureLoader();
	    for ( var i = 0; i < 4; i ++ ){
	    	this.textures[ i ] = loader.load( 'css/noise' + ( i + 1 ) + '.png' );
	    }
		uniforms.noiseTexture.value = uniforms2.noiseTexture.value = this.textures[ 0 ];

	};

    this.addGui = function(){
    	var scope = this;
		var API = {
					'开启消融'    	: false,
					'消融渐变颜色'    	: [255, 255, 0],
					'时间'    	: 5.0,
					'切换消融方式'    	: 0,
				};
		var gui = new dat.GUI();
		gui.add( API, '开启消融' ).onChange( function(val) {
			    openDissolving = val;
			    if(!val){
			   	    uniforms.time.value =  uniforms2.time.value = 0.0;
			    }
		} );

		gui.add( API, '时间', 2, 10, 0.1 ).onChange( function(val) {
				looptime = val*1000;
		} );

		gui.addColor( API, '消融渐变颜色' ).onChange( function(val) {
			    uniforms2.DissolvingColor.value.x = uniforms.DissolvingColor.value.x = val[0]/255;//转到着色器数值范围[0-1]
			    uniforms2.DissolvingColor.value.y = uniforms.DissolvingColor.value.y = val[1]/255;
			    uniforms2.DissolvingColor.value.z = uniforms.DissolvingColor.value.z = val[2]/255;
		} );

        gui.add( API, '切换消融方式', { Perlin: 0, Squares: 3, Cells: 1, Distort: 2} ).onChange( function( value ) {
		    uniforms.noiseTexture.value = uniforms2.noiseTexture.value = scope.textures[ value ];
	    } )

	}
}
var _Dissolving = new Dissolving();
_Dissolving.init();
_Dissolving.addGui();
