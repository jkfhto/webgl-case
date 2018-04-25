var Globe = function(){
	var camera, scene, renderer;
	var mesh,obj;
	var DirectionalLight
	var cloudsphere,pointsNum=2000,fdNum=50,pointsSize=.5;//fdNum:曲线分段 pointsSize:粒子大小 
	var earthSphere,stats;
	var uniformsArr=[],lengthArr=[],particlesArr=[],lineArr=[],pointsIndex=0,rotate_z=[],centerArr=[];
	var Start_random=false,Rotate_points=false;
	var scope=this;
	var line;
	var uniforms = {
		time: {
			type: "f",
			value: 0.1
		}
	}
	this.init = function() {
	    stats = new Stats();
		document.body.appendChild(stats.dom);

		var AMOUNT = 6;
		var SIZE = 1 / AMOUNT;
		var ASPECT_RATIO = window.innerWidth / window.innerHeight;

	    camera = new THREE.PerspectiveCamera( 75, ASPECT_RATIO, 0.1, 100000 );
		camera.position.z=8;
		scene = new THREE.Scene();
	    var bgTexture = new THREE.TextureLoader().load( "css/bg-stars-large.png" );
		scene.background=bgTexture;
		scene.add( new THREE.AmbientLight( 0x222244 ) );

	    DirectionalLight = new THREE.DirectionalLight();
		DirectionalLight.position.set( 10.5, 10.5, 10 );
		DirectionalLight.castShadow = true;
		scene.add( DirectionalLight );
		var light = new THREE.PointLight( 0xff0000, 1, 100 );
		light.position.set( 0, -1, 0 );
		scene.add( light );

		var earthGeometry = new THREE.SphereGeometry( 4, 100, 100 );
		var map = new THREE.TextureLoader().load( "css/earth_surface.jpg" );
		var normalMap = new THREE.TextureLoader().load( "css/earth_normals.jpg" );
		var specularMap = new THREE.TextureLoader().load( "css/earth_specular.jpg" );
		var earthMaterial = new THREE.MeshPhongMaterial( {
			// specular: 0x222222,
			shininess: 25,
			map: map,
			normalMap:normalMap,
			specularMap:specularMap
		} );
		earthSphere = new THREE.Mesh( earthGeometry, earthMaterial );
		scene.add( earthSphere );
		var cloudMap = new THREE.TextureLoader().load( "css/cloud.png" );
		var cloudgeometry = new THREE.SphereGeometry( 4.05, 100, 100 );
		var cloudmaterial = new THREE.MeshPhongMaterial( {
			map: cloudMap,
			transparent:true,
			depthTest:false
		} );
		cloudsphere = new THREE.Mesh( cloudgeometry, cloudmaterial );
		scene.add( cloudsphere );
		this.addline_points();
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		document.body.appendChild( renderer.domElement );
		controls=new THREE.OrbitControls(camera,renderer.domElement);
		window.addEventListener( 'resize', this.onWindowResize, false );
	}

	this.onWindowResize = function() {
		console.log(this)
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	this.animate = function() {
		stats.update();
		cloudsphere.rotation.y+=.001;
		earthSphere.rotation.y+=.0005;
		var time = Date.now();
		var looptime = 20 * 100;//设置速度
		var t = ( time % looptime ) / looptime;//限制在[0,1]范围
		// var tt = ( time % looptime ) ;
		uniforms.time.value = t;
		// for(var i=0,j=lineArr.length;i<j;i++){
		// 	uniformsArr[i].time.value = t;
		// }
		// var axis = new THREE.Vector3().copy(rotate_z[0]);//向量axis
		// lineArr[0].rotateOnAxis(axis,.01)
		// if(Rotate_points){
			// for(var i=0;i<rotate_z.length;i++){
			// 	// uniformsArr[i].time.value +=lengthArr[i]/500 ;
			// 	var axis = new THREE.Vector3().copy(rotate_z[i]);//向量axis
		 //        lineArr[0].rotateOnAxis(axis,.01)
			// }
		// }
		renderer.render( scene, camera );
		requestAnimationFrame( scope.animate );
	}

	this.JSQEX_removeall=function() {
		// for(var ii=0,jj=particlesArr.length;ii<jj;ii++){
		// 	particlesArr[ii].geometry.dispose()
		// 	particlesArr[ii].material.dispose();
		// 	particlesArr[ii].material.uniforms.texture.value.dispose();
		// 	particlesArr[ii].parent.remove(particlesArr[ii])
		// }
		for(var i=0,j=lineArr.length;i<j;i++){
			lineArr[i].geometry.dispose()
			lineArr[i].material.dispose();
			earthSphere.remove(lineArr[i])
		}
		particlesArr=[];
		lineArr=[];
	}

	this.rotateAroundWorldAxis=function(object, axis, radians) {
	    var rotWorldMatrix = new THREE.Matrix4();
	    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	    rotWorldMatrix.multiply(object.matrix);                // pre-multiply
	    object.matrix = rotWorldMatrix;
	    object.rotation.setFromRotationMatrix(object.matrix);
	}

	this.addline_points=function(){
		// pointsNum=num!=undefined?num:Start_random?2:Math.floor(2+Math.random()*100);
	    pointsIndex=Math.floor(Math.random()*300);
		this.JSQEX_removeall();
		var positions=[];
		var uvs=[],colors=[],indices_array = [],sizes=[];
	    for(var ii=0;ii<2;ii+=2){
	    	var dd=ii%300;
	    	var position1=latlngPosFromLatLng(locations[Start_random?dd:pointsIndex].lat,locations[Start_random?dd:pointsIndex].lng,4.05);
			var position2=latlngPosFromLatLng(locations[dd+1].lat,locations[dd+1].lng,4.05);
			var _position1=new THREE.Vector3(position1.x,position1.y,position1.z);
			var _position2=new THREE.Vector3(position2.x,position2.y,position2.z);
			var length=new THREE.Vector3().subVectors(_position1,_position2).length()/2;
			lengthArr.push(length);
			var center=new THREE.Vector3().addVectors(_position1,_position2).multiplyScalar(.5);
			var Z=new THREE.Vector3().copy(_position1).cross(_position2).normalize();
			var X=new THREE.Vector3().subVectors(_position1,_position2).normalize();
	        var Y=new THREE.Vector3().copy(Z).cross(X).normalize();
	        var num=28;
	        var _arr=[];
	        for(var i=0;i<=num;i++){//计算圆上点的坐标
	        	_arr.push(new THREE.Vector3(
		        		      X.x*Math.cos(i/num*Math.PI*2)+Y.x*Math.sin(i/num*Math.PI*2),
		        		      X.y*Math.cos(i/num*Math.PI*2)+Y.y*Math.sin(i/num*Math.PI*2),
		        		      X.z*Math.cos(i/num*Math.PI*2)+Y.z*Math.sin(i/num*Math.PI*2)).multiplyScalar(length)//注意加上center点坐标
	                    )
	        }
			var spline = new THREE.CatmullRomCurve3(_arr);
			var h = 0.2 * Math.random();
			var s = 0.5 + 0.5 * Math.random();
			var l = 0.5 + 0.5 * Math.random();
			// for(var i=0;i<fdNum;i++){
			//    var vec=	spline.getPoint(i/fdNum);;
	  //          positions.push(vec.x,vec.y,vec.z);
	  //          uvs.push((1-i/fdNum)*Math.PI/2,0.0);//关键代码 设置uv用于射线生成
			//    var color=new THREE.Color().setHSL(h,s,l);
			//    colors[ ( 3 * i )  + fdNum*ii/2*3  ] = color.r;
			//    colors[ ( 3 * i ) + 1 + fdNum*ii/2*3] = color.g;
			//    colors[ ( 3 * i ) + 2 + fdNum*ii/2*3] = color.b;
			//    if(i==fdNum-1){//设置索引
			//    	 indices_array.push(i+fdNum*ii/2,fdNum*ii/2);
			//    }else{
			//    	 indices_array.push(i+fdNum*ii/2,i+1+fdNum*ii/2);
			//    }
			//    sizes[ i + fdNum*ii/2 ] = pointsSize+Math.random();
			// }
			for(var i=0;i<=fdNum;i++){
			   var vec=	spline.getPoint(i/fdNum);;
	           positions.push(vec.x,vec.y,vec.z); 
	           uvs.push((1-i/fdNum)*Math.PI/2,0.0);
			   var color=new THREE.Color().setHSL(h,s,l);
			   colors[ ( 3 * i )     ] = color.r;
			   colors[ ( 3 * i ) + 1 ] = color.g;
			   colors[ ( 3 * i ) + 2 ] = color.b;
			   sizes[ i ] = pointsSize+Math.random();
			   // sizesAll.push(.7)
			}
			// centerArr.push(center.x,center.y,center.z);
	    }
	    var instances = 6500;
	    var geometry=new THREE.InstancedBufferGeometry();//通过绘制一个BufferGeometry对象相对于每次绘制一条射线性能明显提升性能明显提升
	    // geometry.setIndex( indices_array );
	    geometry.maxInstancedCount = instances;
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
		var offsets = new THREE.InstancedBufferAttribute( new Float32Array( instances * 3 ), 3, 1 );
		var centerArr = new Float32Array( instances * 3 );
		for(var ii=0;ii<instances;ii+=3){
	    	var dd=ii%700;
	    	var position1=latlngPosFromLatLng(locations[Start_random?dd:pointsIndex].lat,locations[Start_random?dd:pointsIndex].lng,4.05);
			var position2=latlngPosFromLatLng(locations[dd+1].lat,locations[dd+1].lng,4.05);
			var _position1=new THREE.Vector3(position1.x,position1.y,position1.z);
			var _position2=new THREE.Vector3(position2.x,position2.y,position2.z);
			// var length=new THREE.Vector3().subVectors(_position1,_position2).length()/2;
			// lengthArr.push(length);
			var center=new THREE.Vector3().addVectors(_position1,_position2).multiplyScalar(.5);
			// centerArr.push(center.x,center.y,center.z);
	        centerArr[ ii + 0 ] = center.x;
		    centerArr[ ii + 1 ] = center.y;
		    centerArr[ ii + 2 ] =center.z;
	    }
		geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( centerArr, 3, 1 ) );
		var vertexShader="varying vec2 vUv;\n"+
            "attribute vec3 customColor;\n"+
            "attribute vec3 offset;\n"+
            "varying vec3 vColor;\n"+
			"void main()	{\n"+
			"	vUv = uv;\n"+
			"	vColor=customColor;\n"+
			"	vec4 mvPosition = modelViewMatrix * vec4( position+offset, 1.0 );\n"+
			"	gl_Position = projectionMatrix * mvPosition;\n"+
			"}";
		var fragmentShader=	"varying vec2 vUv;\n"+
            "uniform float time;\n"+
            "varying vec3 vColor;\n"+
			"void main()	{\n"+
			// "	float aa=(vUv.x-.2+time);\n"+//根据不同点uv不同 实现射线发射
			// "	float dd=step(1.57,aa)*1.57;\n"+//确保已经显示的曲线在整条射线显示完整前保持显示 1.57:半圈
			// "	gl_FragColor = vec4(vColor, sin(dd) );\n"+//沿着曲线方向修改透明度实现射线发射效果
			// "	gl_FragColor = vec4(vColor, sin(2.0*(vUv.x*3.0+time)));\n"+
			"	gl_FragColor = vec4(vColor, 1.);\n"+
			// "	if(gl_FragColor.a < 0.5) discard;\n"+
			"}"
		var lineMaterial = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: true,
		} );
		line=new THREE.Line( geometry, lineMaterial  );
		// rotate_z.push(Z);
		line.rotate_znum=0;
		lineArr.push(line);
        earthSphere.add(line);
        var vertexshader_point="uniform float amplitude;\n"+
				"attribute float size;\n"+
				"attribute vec3 customColor;\n"+
				"varying vec3 vColor;\n"+
				"void main() {"+
				"	vColor = customColor;\n"+
				"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n"+
				"	gl_PointSize = size * ( 300.0 / -mvPosition.z );\n"+//根据深度值修改大小
				"	gl_Position = projectionMatrix * mvPosition;\n"+
				"}";
		var fragmentshader_point="uniform vec3 color;\n"+
			"uniform sampler2D texture;\n"+
			"varying vec3 vColor;\n"+
			"void main() {"+
			"	gl_FragColor = vec4( color * vColor, 1.0 );\n"+
			"	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n"+
			"	if(gl_FragColor.a < 0.1) discard;\n"+
			"}"	
        var material = new THREE.ShaderMaterial( {
				uniforms: {
					u_modelViewMatrix : { value: new THREE.Matrix4() },
					amplitude: { value: 1.0 },
					color:     { value: new THREE.Color( 0xffffff ) },
					texture:   { value: new THREE.TextureLoader().load( "css/spark1.png" ) }
				},
				vertexShader:   vertexshader_point,
				fragmentShader: fragmentshader_point,

				blending:       THREE.AdditiveBlending,
				depthWrite:      false,
				transparent:    true
		   });
        var geometry=new THREE.BufferGeometry();//通过绘制一个BufferGeometry对象相对于每次绘制一条射线性能明显提升性能明显提升
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
		geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) )
		var particles = new THREE.Points(geometry, material );
		particlesArr.push(particles);
		// line.add(particles);
	}

	this.addGui=function(){
		var API = {
					'Start random'    	: true,
					'Rotate points'		: false,
					'Num points'		: pointsNum,
					'Size points'       : pointsSize,   
				};
		var gui = new dat.GUI();
		gui.add( API, 'Start random' ).onChange( function(val) {
				Start_random = val;
				scope.addline_points();
		} );
		gui.add( API, 'Rotate points' ).onChange( function(val) {
				Rotate_points=val;
		} );
		gui.add( API, 'Num points' ,40, 200, 2).onChange( function(val) {
				pointsNum=val;
				scope.addline_points();
		} );
		gui.add( API, 'Size points' ,.5, 2, .1).onChange( function(val) {
				pointsSize=val;
				scope.addline_points();
		} );
	}
}
var globeObj=new Globe();
globeObj.init();
globeObj.animate();
globeObj.addGui();