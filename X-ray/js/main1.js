var container, stats;
var renderer;
var transition;

var clock = new THREE.Clock();

init();
animate();

function init() {

	initGUI();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	stats = new Stats();
	document.body.appendChild( stats.dom );
	var cameraMain =new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	var sceneA = new Scene1( cameraMain, 0xffffff );
	var sceneB = new Scene2( cameraMain, 0xffffff );
	// var sceneB = new Scene2("sphere", 500, 2000, 50, new THREE.Vector3(0,0.2,0.1), 0x000000);
 //                    //基本原理：两个场景相互切换 过渡效果：一段时间内是将两个场景渲染为帧缓存对象 作为纹理使用 使用mix混合函数产生过渡效果 其他的时间正常渲染到屏幕显示
	transition = new Transition(sceneA,sceneB);
	controls = new THREE.OrbitControls(cameraMain,renderer.domElement);

}

function animate() {
    controls.update();
	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	transition.render( clock.getDelta() );

}