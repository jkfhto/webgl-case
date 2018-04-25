var Globe = function(){
	var camera, scene, renderer;
	var mesh,obj;
	var DirectionalLight
	var cloudsphere,pointsNum=20,fdNum=50,pointsSize=.5;//fdNum:曲线分段 pointsSize:粒子大小 
	var earthSphere,stats;
	var uniformsArr=[],lengthArr=[],particlesArr=[],lineArr=[],pointsIndex=0,particlesPos=[];
	var Start_random=true,Rotate_points=false;
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
		uniforms.time.value = 1;
		scope.update_partice();
		renderer.render( scene, camera );
		requestAnimationFrame( scope.animate );
	}
    // var worker =new Worker("js/worker.js");

	this.update_partice = function(){//根据相邻的顶点插值获取顶点左边
		// console.time("时间")
		if(!Rotate_points) return;
		for( var i = 0,j = particlesArr.length;i < j;i++){
			for(var ii = 0,jj = particlesArr[i].length;ii<jj;ii++){
				var particle = particlesArr[i][ii];
				var path = particle.path;
				particle.lerpN += 0.02;

				if(particle.lerpN >= 1){//currentPoint 索引值加1
					particle.lerpN = 0;
					particle.moveIndex = particle.nextIndex;
					particle.nextIndex++;
					if( particle.nextIndex >= fdNum ){
						// particle.moveIndex = 0;
						particle.nextIndex = 0;
					}
				}
				var num = ii+particle.moveIndex;//设置currentPoint的索引值
				if(num>=fdNum){//限制索引值范围
					num = ii+particle.moveIndex-fdNum;
				}

				var currentPoint = particlesArr[i][num].clone();
				var nextPoint = particlesArr[i][num+1>=fdNum?0:num+1].clone();

				currentPoint.lerp( nextPoint, particle.lerpN );
				this.Pointsgeometry.attributes.position.array[i*fdNum*3+ii*3]=currentPoint.x;
				this.Pointsgeometry.attributes.position.array[i*fdNum*3+ii*3+1]=currentPoint.y;
				this.Pointsgeometry.attributes.position.array[i*fdNum*3+ii*3+2]=currentPoint.z;
			}
		}
		this.Pointsgeometry.attributes.position.needsUpdate = true;//更新缓存区顶点数据
		
		// worker.onmessage = function (e) {
		//     var data = e.data;
		//     scope.Pointsgeometry.attributes.position.array = data;
		//     scope.Pointsgeometry.attributes.position.needsUpdate = true;//更新缓存区顶点数据
		//     worker.postMessage([particlesArr,fdNum,scope.Pointsgeometry.attributes.position.array]);
		// }
		// console.timeEnd("时间")
		
	}

	this.JSQEX_removeall=function() {
		for(var i=0,j=lineArr.length;i<j;i++){
			lineArr[i].geometry.dispose()
			lineArr[i].material.dispose();
			earthSphere.remove(lineArr[i])
		}
		if(this.particles){
			this.particles.geometry.dispose();
			this.particles.material.dispose();
			this.particles.material.uniforms.texture.value.dispose();
			this.particles.parent.remove(this.particles)
		}
		particlesArr=[];
		particlesPos=[];
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
		var vector = new THREE.Vector4();

	    for(var ii = 0;ii < pointsNum;ii+=2){
	    	var dd = ii%700;
	    	var position1 = latlngPosFromLatLng(locations[Start_random?dd:pointsIndex].lat,locations[Start_random?dd:pointsIndex].lng,4.05);
			var position2 = latlngPosFromLatLng(locations[dd+1].lat,locations[dd+1].lng,4.05);
			var _position1 = new THREE.Vector3(position1.x,position1.y,position1.z);
			var _position2 = new THREE.Vector3(position2.x,position2.y,position2.z);
			var length = new THREE.Vector3().subVectors(_position1,_position2).length()/2;
			lengthArr.push(length);
			var center = new THREE.Vector3().addVectors(_position1,_position2).multiplyScalar(.5);
			var Z = new THREE.Vector3().copy(_position1).cross(_position2).normalize();
			var X = new THREE.Vector3().subVectors(_position1,_position2).normalize();
	        var Y = new THREE.Vector3().copy(Z).cross(X).normalize();
	        var num=28;
	        var _arr=[];
	        for(var i=0;i<=num;i++){//计算圆上点的坐标
	        	_arr.push(new THREE.Vector3(
		        		      X.x*Math.cos(i/num*Math.PI*2)+Y.x*Math.sin(i/num*Math.PI*2),
		        		      X.y*Math.cos(i/num*Math.PI*2)+Y.y*Math.sin(i/num*Math.PI*2),
		        		      X.z*Math.cos(i/num*Math.PI*2)+Y.z*Math.sin(i/num*Math.PI*2)).multiplyScalar(length).add(center)//注意加上center点坐标
	                    )
	        }
			var spline = new THREE.CatmullRomCurve3(_arr);
			var h = 0.2 * Math.random();
			var s = 0.5 + 0.5 * Math.random();
			var l = 0.5 + 0.5 * Math.random();
			var positions_path=[];
			for(var i=0;i<fdNum;i++){
			    var vec=	spline.getPoint(i/fdNum);
			    positions_path.push(vec);
			    vec.lerpN = 0;
			    vec.moveIndex = 0;
			    vec.nextIndex = 1;
	            positions.push(vec.x,vec.y,vec.z);
	           	particlesPos.push(vec.x,vec.y,vec.z);
	            uvs.push((1-i/fdNum)*Math.PI/2,0.0);//关键代码 设置uv用于射线生成
			    var color=new THREE.Color().setHSL(h,s,l);
			    colors[ ( 3 * i )  + fdNum*ii/2*3  ] = color.r;
			    colors[ ( 3 * i ) + 1 + fdNum*ii/2*3] = color.g;
			    colors[ ( 3 * i ) + 2 + fdNum*ii/2*3] = color.b;
			    if(i==fdNum-1){//设置索引
			   	    indices_array.push(i+fdNum*ii/2,fdNum*ii/2);
			    }else{
			   	    indices_array.push(i+fdNum*ii/2,i+1+fdNum*ii/2);
			    }
			   sizes[ i + fdNum*ii/2 ] = pointsSize+Math.random();
			}
			particlesArr.push(positions_path)
	    }
	    var geometry=new THREE.BufferGeometry();//通过绘制一个BufferGeometry对象相对于每次绘制一条射线性能明显提升性能明显提升
	    geometry.setIndex( indices_array );
	    // modelMatrix_buf = new THREE.Float32BufferAttribute( modelMatrix_1, 16 ).setDynamic( true )
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
		var vertexShader="varying vec2 vUv;\n"+
            "attribute vec3 customColor;\n"+
            // "attribute vec3 orientation;\n"+
            "varying vec3 vColor;\n"+
			"void main()	{\n"+
			"	vUv = uv;\n"+
			"	vColor=customColor;\n"+
			// "vec3 vPosition = position;\n"+
		 //    "vec3 vcV = cross( orientation.xyz, vPosition );\n"+
			// "vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );\n"+

				// gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );
			"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n"+
			"	gl_Position = projectionMatrix * mvPosition;\n"+
			"}";
		var fragmentShader=	"varying vec2 vUv;\n"+
            "uniform float time;\n"+
            "varying vec3 vColor;\n"+
			"void main()	{\n"+
			"	float aa=(vUv.x-.2+time);\n"+//根据不同点uv不同 实现射线发射
			"	float dd=step(1.57,aa)*1.57;\n"+//确保已经显示的曲线在整条射线显示完整前保持显示 1.57:半圈
			"	gl_FragColor = vec4(vColor, sin(dd) );\n"+//沿着曲线方向修改透明度实现射线发射效果
			// "	gl_FragColor = vec4(vColor, sin(2.0*(vUv.x*3.0+time)));\n"+
			// "	gl_FragColor = vec4(vColor, 1.);\n"+
			// "	if(gl_FragColor.a < 0.5) discard;\n"+
			"}"
		var lineMaterial = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: true,
		} );
		line=new THREE.LineSegments( geometry, lineMaterial  );
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
        this.Pointsgeometry=new THREE.BufferGeometry();//通过绘制一个BufferGeometry对象相对于每次绘制一条射线性能明显提升性能明显提升
        this.Pointsgeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlesPos, 3 ).setDynamic( true ) );
		// this.Pointsgeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		this.Pointsgeometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		this.Pointsgeometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
		this.Pointsgeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) )
		this.particles = new THREE.Points(this.Pointsgeometry, material );
		line.add(this.particles);

		// worker.postMessage([particlesArr,fdNum,this.Pointsgeometry.attributes.position.array]);
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
		gui.add( API, 'Num points' ,2, 800, 2).onChange( function(val) {
				pointsNum=val;
				scope.addline_points();
		} );
		gui.add( API, 'Size points' ,.05, 2, .05).onChange( function(val) {
				pointsSize=val;
				scope.addline_points();
		} );
	}
}
var globeObj=new Globe();
globeObj.init();
globeObj.animate();
globeObj.addGui();