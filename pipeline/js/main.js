var pipeLine=function(){
	var camera, scene, renderer,controls,pointLight,tubeGeometry,sphereMesh;
	var mesh,binormal=new THREE.Vector3(),normal=new THREE.Vector3(),lookAt=new THREE.Vector3();
    var scope=this;
	this.init = function() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 40;

		scene = new THREE.Scene();
		var AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
	    scene.add( AmbientLight );

	    DirectionalLight = new THREE.DirectionalLight();
		DirectionalLight.position.set( 10.5, 10.5, 10 );
		DirectionalLight.castShadow = true;
		scene.add( DirectionalLight );

		pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
		pointLight.position.set( 0, -1, 0 );

		var SphereGeometry = new THREE.SphereGeometry( .4, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		sphereMesh = new THREE.Mesh( SphereGeometry, material );
		scene.add( sphereMesh );
		sphereMesh.add(pointLight);

		var DirectionalGeometry = new THREE.SphereGeometry( .4, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		DirectionalMesh = new THREE.Mesh( DirectionalGeometry, material );
		scene.add( DirectionalMesh );
		DirectionalMesh.add(DirectionalLight);

		var sampleClosedSpline = new THREE.CatmullRomCurve3( [
				new THREE.Vector3( -10, -10 ,00 ),
				new THREE.Vector3( 10, 10 ,10 ),
				new THREE.Vector3( 20, 0 ,10 ),
				new THREE.Vector3( 10, -10  ,0),
				new THREE.Vector3( -10, 10 ,0 ),
				new THREE.Vector3( -20, 0 ,0 ),
		] );
		sampleClosedSpline.type = 'catmullrom';
		sampleClosedSpline.closed = true;
		tubeGeometry = new THREE.TubeBufferGeometry( sampleClosedSpline,100, 2, 14, true );
		var map = new THREE.TextureLoader().load( "css/1.png" );
		var normalMap = new THREE.TextureLoader().load( "css/2.png" );
		var alphaMap = new THREE.TextureLoader().load( "css/3.png" );
		normalMap.wrapS = map.wrapS = alphaMap.wrapS = THREE.RepeatWrapping;
		normalMap.wrapT = map.wrapT = alphaMap.wrapT = THREE.RepeatWrapping;
		alphaMap.repeat.set( 100, 10 );
		normalMap.repeat.set( 100, 10 );
		map.repeat.set(100,10);
	    var Material = new THREE.MeshPhongMaterial( {
			shininess: 25,
			map: map,
			normalMap:normalMap,
			alphaMap:alphaMap,
			alphaTest:.1,
			side:THREE.DoubleSide

		});
		var tubeMesh = new THREE.Mesh(tubeGeometry,Material)
		scene.add(tubeMesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		// controls=new THREE.OrbitControls(camera,renderer.domElement);
		window.addEventListener( 'resize', this.onWindowResize, false );

	}

	this.onWindowResize = function() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	this.animate = function() {

		var time = Date.now();
		var looptime = 20 * 1000;//设置速度
		var t = ( time % looptime ) / looptime;//限制在[0,1]范围

		var pos = tubeGeometry.parameters.path.getPointAt( t );//计算当前时间对应的曲线位置
	    

		var segments = tubeGeometry.tangents.length;//获取曲线分段数
		var pickt = t * segments;//计算当前时间对应的曲线分段数
		var pick = Math.floor( pickt );
		var pickNext = ( pick + 1 ) % segments;//计算下一段 并且限制在[1,segments]

		binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
		binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );//计算负法线

		var dir = tubeGeometry.parameters.path.getTangentAt( t );//计算当前时间对应的曲线位置处的切线向量

		normal.copy( binormal ).cross( dir );//计算法线向量
		lookAt.copy( pos ).add( dir );//设置视线平行tubeGeometry表面
		var spherePosition=tubeGeometry.parameters.path.getPointAt( t+0.03>1?t+0.03-1:t+0.03 );
		sphereMesh.position.copy(spherePosition);

		var pyPosition=pos.clone().add(binormal.clone().multiplyScalar(3));
		DirectionalMesh.position.copy(pyPosition)

	    camera.up=normal;
	    camera.lookAt(lookAt);
	    camera.position.copy(pos)


		renderer.render( scene,camera );
		requestAnimationFrame( scope.animate );

	}
}
var pipeLine1=new pipeLine();
pipeLine1.init();
pipeLine1.animate();



