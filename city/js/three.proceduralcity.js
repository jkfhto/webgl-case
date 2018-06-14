// from @mrdoob http://www.mrdoob.com/lab/javascript/webgl/city/01/

var THREE = THREE || {}

THREE.ProceduralCity	= function(renderer){
	// build the base geometry for each building
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	// 将重心更改为立方体的底部，而不是其中心
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
	// 删除底部的平面
	geometry.faces.splice( 6, 2 );
	geometry.faceVertexUvs[0].splice( 6, 2 );
	// 更改顶部的uv
	geometry.faceVertexUvs[0][4][0].set( 0, 0 );
	geometry.faceVertexUvs[0][4][1].set( 0, 0 );
	geometry.faceVertexUvs[0][4][2].set( 0, 0 );
	geometry.faceVertexUvs[0][5][0].set( 0, 0 );
	geometry.faceVertexUvs[0][5][1].set( 0, 0 );
	geometry.faceVertexUvs[0][5][2].set( 0, 0 );
	// buildMesh
	var buildingMesh= new THREE.Mesh( geometry );

	// base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
	var light	= new THREE.Color( 0xffffff );
	var shadow	= new THREE.Color( 0x303050 );

	var cityGeometry= new THREE.Geometry();
	var matrix = new THREE.Matrix4();
	var matrixRotation = new THREE.Matrix4();
	for( var i = 0; i < 20000; i ++ ){

		// 位置随机
		var posx	= Math.floor( Math.random() * 200 - 100 ) * 10;
		var posz	= Math.floor( Math.random() * 200 - 100 ) * 10;
		matrix.makeTranslation(posx,0,posz);
		// 绕Y轴随机旋转
		var rotationy	= Math.random()*Math.PI*2;
		matrixRotation.makeRotationY(rotationy);
		matrix.multiplyMatrices(matrixRotation,matrix);
		// 随机缩放
		var scalex	= Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
		var scaley	= (Math.random() * Math.random() * Math.random() * scalex) * 8 + 8;
		var scalez	= scalex;
		var scale_v = new THREE.Vector3( scalex, scaley, scalez );
		matrix.scale(scale_v);

		// establish the base color for the buildingMesh
		var value	= 1 - Math.random() * Math.random();
		var baseColor	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
		// set topColor/bottom vertexColors as adjustement of baseColor
		var topColor	= baseColor.clone().multiply( light );
		var bottomColor	= baseColor.clone().multiply( shadow );
		// set .vertexColors for each face
		// var geometry	= buildingMesh.geometry;		
		for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
			if ( j === 4 || j===5 ) {
				// 设置顶部的顶点颜色
				geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor];//需要重新赋值顶点颜色 不能直接push
			} else {
				// 设置侧面的顶点颜色
				if(j%2 === 0){//对应平面第一个逆时针的三角形
					geometry.faces[ j ].vertexColors = [ topColor, bottomColor, topColor ];
				}else{//对应平面第二个逆时针的三角形
					geometry.faces[ j ].vertexColors = [ bottomColor, bottomColor, topColor ];
				}
			}
		}
		// merge it with cityGeometry - very important for performance
		cityGeometry.merge(  geometry , matrix);//合并geometry实现批处理 必须是使用同一材质的物体才能生效 减少draw call提高效率
	}

	// generate the texture
	var texture		= new THREE.Texture( generateTextureCanvas() );
	texture.anisotropy	= renderer.capabilities.getMaxAnisotropy();//查询当前系统支持的最大各向异性过滤的数值
	texture.needsUpdate	= true;

	// build the mesh
	var material	= new THREE.MeshLambertMaterial({
		map		: texture,
		vertexColors	: THREE.VertexColors
	});
	var mesh = new THREE.Mesh(cityGeometry, material );
	return mesh

	function generateTextureCanvas(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32;
		canvas.height	= 64;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#ffffff';
		context.fillRect( 0, 0, 32, 64 );
		// draw the window rows - with a small noise to simulate light variations in each room绘制窗口 - 用小的噪音来模拟每个房间的光线变化
		for( var y = 2; y < 64; y += 2 ){
			for( var x = 0; x < 32; x += 2 ){
				var value	= Math.floor( Math.random() * 128 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 2, 1 );
			}
		}

		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing默认情况下，当你增加分辨率时，你会得到一个平滑的结果，所以它可能很容易出现模糊。为了避免这种伪影，.imageSmoothedEnabled在context上禁用
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}
}