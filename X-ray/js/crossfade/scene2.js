function generateGeometry( objectType, numObjects ) {

	var geometry = new THREE.Geometry();

	function applyVertexColors( g, c ) {

		g.faces.forEach( function( f ) {

			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

			for ( var j = 0; j < n; j ++ ) {

				f.vertexColors[ j ] = c;

			}

		} );

	}

	for ( var i = 0; i < numObjects; i ++ ) {

		var position = new THREE.Vector3();

		position.x = Math.random() * 100 - 50;
		position.y = Math.random() * 60 - 30;
		position.z = Math.random() * 80 - 40;

		var rotation = new THREE.Euler();

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;

		var scale = new THREE.Vector3();

		var geom, color = new THREE.Color();

		scale.x = Math.random() * 2 + 1;

		if ( objectType == "cube" ) {

			geom = new THREE.BoxGeometry( 1, 1, 1 );
			scale.y = Math.random() * 2 + 1;
			scale.z = Math.random() * 2 + 1;
			color.setRGB( 0, 0, Math.random() + 0.1 );

		} else if ( objectType == "sphere" ) {

			geom = new THREE.IcosahedronGeometry( 1, 1 );
			scale.y = scale.z = scale.x;
			color.setRGB( Math.random() + 0.1, 0, 0 );

		}

		// give the geom's vertices a random color, to be displayed
		applyVertexColors( geom, color );

		var mesh = new THREE.Mesh( geom );
		mesh.position.copy( position );
		mesh.rotation.copy( rotation );
		mesh.scale.copy( scale );
		mesh.updateMatrix();

		geometry.merge( mesh.geometry, mesh.matrix );

	}

	return geometry;

}

function Scene2 ( cameraMain, clearColor ) {
    // , 500, 2000, 50, new THREE.Vector3(0,0.2,0.1)
	this.clearColor = clearColor;

	this.camera = cameraMain;
	// this.camera.position.z = 2000;

	// Setup scene
	this.scene = new THREE.Scene();
	this.scene.add( new THREE.AmbientLight( 0x555555 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	this.scene.add( light );

	this.rotationSpeed =new THREE.Vector3(0,0.2,0.1);

	var defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
	this.mesh = new THREE.Mesh( generateGeometry( "sphere", 50 ), defaultMaterial );
	this.scene.add( this.mesh );

	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	this.depthFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
	this.colorFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
    var materialDepth = new THREE.MeshDepthMaterial();

	this.render = function( delta, rtt ) {

		this.mesh.rotation.x += delta * this.rotationSpeed.x;
		this.mesh.rotation.y += delta * this.rotationSpeed.y;
		this.mesh.rotation.z += delta * this.rotationSpeed.z;

		renderer.setClearColor( this.clearColor );
                //场景切换与场景中物体运动过渡
		// if ( rtt )
			//将场景渲染为 WebGLRenderTarget 对应帧缓存对象，就是屏幕显示的一帧在内存的表示  不会直接在平面显示 可以作为纹理显示
			this.scene.overrideMaterial = materialDepth;
			renderer.render( this.scene, this.camera, this.depthFbo, true );
			this.scene.overrideMaterial = null;
			renderer.render( this.scene, this.camera, this.colorFbo, true );
		// else
		// 	//正常渲染场景 
		 //    this.scene.overrideMaterial = null;
			// renderer.render( this.scene, this.camera );

	};

}
