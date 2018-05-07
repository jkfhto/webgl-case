function Transition ( sceneA, sceneB ) {

	this.scene = new THREE.Scene();

	this.cameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10, 10 );

	this.quadmaterial = new THREE.ShaderMaterial( {

		uniforms: {
			uResolution: {
				type :"v2",
	            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
	        },
			tDiffusedep1: {
				value: null
			},
			tDiffusedep2: {
				value: null
			},
			tDiffusecol1: {
				value: null
			},
			tDiffusecol2: {
				value: null
			},
		},
		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"vUv = vec2( uv.x, uv.y );",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),
		fragmentShader: [
		    "float LinearizeDepth(float depth, float near, float far) {",//将屏幕空间中非线性的深度值变换至线性深度值
			    "float z = depth * 2.0 - 1.0;", // back to NDC
			    // return z;
			    "return (2.0 * near * far) / (far + near - z * (far - near)) / far *2.0;",
			"}",

		    "uniform vec2 uResolution;",

			"uniform sampler2D tDiffusedep1;",
			"uniform sampler2D tDiffusedep2;",
			"uniform sampler2D tDiffusecol1;",
			"uniform sampler2D tDiffusecol2;",
			"uniform sampler2D tMixTexture;",

			"varying vec2 vUv;",

			"void main() {",

			"float dep1 = texture2D( tDiffusedep1, vUv ).x;",
			"float dep2 = texture2D( tDiffusedep2, vUv ).x;",
            
            // "gl_FragColor = vec4( LinearizeDepth(texture2D( tDiffusedep1, vUv ).x,1.0,2000.0), 0.0, 0.0, 1.0 );",
            // "gl_FragColor = unpackRGBAToDepth(texture2D( tDiffusedep1, vUv ).x);",
            // "gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.0 );",
			"if (dep1 > dep2) {",

				"vec4 col1 = texture2D( tDiffusecol1, vUv );",
				"vec4 col2 = texture2D( tDiffusecol2, vUv );",
				"gl_FragColor = col1 + col2;",
				// "gl_FragColor = vec4( dep1, 0.0, 0.0, 1.0 );",
			"} else {",
                "vec3 col1 = texture2D( tDiffusecol1, vUv ).xyz;",
				"vec3 col2 = vec3( 1.0, 0.0, 1.0);",
				"gl_FragColor = vec4(col1 + col2,1.0);",
				// "gl_FragColor = vec4( dep2, 1.0, 0.0, 1.0 );",

			"}",
		"}"

		].join( "\n" )

	} );

	var quadgeometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );

	this.quad = new THREE.Mesh( quadgeometry, this.quadmaterial );
	this.scene.add( this.quad );

	// Link both scenes and their FBOs
	this.sceneA = sceneA;
	this.sceneB = sceneB;

	this.quadmaterial.uniforms.tDiffusedep1.value = sceneA.depthFbo.texture;
	this.quadmaterial.uniforms.tDiffusedep2.value = sceneB.depthFbo.texture;

	this.quadmaterial.uniforms.tDiffusecol1.value = sceneA.colorFbo.texture;
	this.quadmaterial.uniforms.tDiffusecol2.value = sceneB.colorFbo.texture;

	this.needChange = false;

	this.render = function( delta ) {

			this.sceneA.render( delta, true );
			this.sceneB.render( delta, true );
			renderer.render( this.scene, this.cameraOrtho, null, true );

	}

}
