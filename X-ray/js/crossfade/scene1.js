var camera;
function Scene1 ( camera, clearColor ) {
    var scope = this;
	this.clearColor = clearColor;
	this.camera = camera;
	this.camera.position.x = 50;
	this.camera.position.y = 20;
	// scene
	this.scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	this.scene.add( ambientLight );
	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	this.camera.add( pointLight );
	this.scene.add( this.camera );
    camera = this.camera;
    var materialDepth = new THREE.MeshDepthMaterial();

	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	this.depthFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
	this.colorFbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	this.render = function( delta, rtt ) {
		renderer.setClearColor( this.clearColor );
                //场景切换与场景中物体运动过渡
		// if ( rtt ){
			this.scene.overrideMaterial = materialDepth;
			//将场景渲染为 WebGLRenderTarget 对应帧缓存对象，就是屏幕显示的一帧在内存的表示  不会直接在平面显示 可以作为纹理显示
			renderer.render( this.scene, this.camera, this.depthFbo, true );
			this.scene.overrideMaterial = null;
			renderer.render( this.scene, this.camera, this.colorFbo, true );
		// }else{
			//正常渲染场景 
		 //    this.scene.overrideMaterial = null;
			// renderer.render( this.scene, this.camera );
		// }
	};

	this.addModel = function(){
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
            object.scale.set(3,3,3);
			object.position.y = - 5;
			scope.scene.add( object );

		}, onProgress, onError );

		// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		// var mtlLoader = new THREE.MTLLoader();
		// mtlLoader.setPath( 'mountain/' );
		// mtlLoader.load( 'mount.blend1.mtl', function( materials ) {
		// 	materials.preload();
		// 	var objLoader = new THREE.OBJLoader();
		// 	materials.materials["Material.001"] = ShaderMaterial;//直接修改材质 材质相对于原材质可能会丢失部分细节
		// 	objLoader.setMaterials( materials );
		// 	objLoader.setPath( 'mountain/' );
		// 	objLoader.load( 'mount.blend1.obj', function ( object ) {
		// 		object.scale.set(100,100,100)
		// 		scene.add( object );
		// 	}, onProgress, onError );
		// });
	}

	this.addModel();

}
