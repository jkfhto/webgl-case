var Globe = function(){
	var camera, scene, renderer;
	var mesh,obj;
	var DirectionalLight
	var cloudsphere,pointsNum=40,fdNum=50;
	var earthSphere,stats;
	var uniformsArr=[],splineArr=[],lengthArr=[],particlesArr=[],lineArr=[],pointsIndex=0;
	var Start_random=true,Num_random=true;
	var scope=this;
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
		// bgTexture.wrapS = THREE.RepeatWrapping;
		// bgTexture.wrapT = THREE.RepeatWrapping;
		// bgTexture.repeat.set( 4, 4 );
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
		var tt = ( time % looptime ) ;
		for(var i=0;i<pointsNum/2;i++){
			uniformsArr[i].time.value +=lengthArr[i]/500 ;
			var axis = new THREE.Vector3().copy(lineArr[i].rotate_z);//向量axis
	        lineArr[i].rotateOnAxis(axis,.01)
		}
		renderer.render( scene, camera );
		requestAnimationFrame( scope.animate );
	}

	this.JSQEX_removeall=function() {
		for(var ii=0,jj=particlesArr.length;ii<jj;ii++){
			particlesArr[ii].geometry.dispose()
			particlesArr[ii].material.dispose();
			particlesArr[ii].material.uniforms.texture.value.dispose();
			particlesArr[ii].parent.remove(particlesArr[ii])
		}
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
		// pointsNum=num!=undefined?num:Start_random?40:Math.floor(40+Math.random()*100);
	    pointsIndex=Math.floor(Math.random()*300);
		this.JSQEX_removeall();
		var positionsAll=[],uvsAll=[],colorsAll=[],sizesAll=[];
	    for(var ii=0;ii<pointsNum;ii+=2){
	    	var position1=latlngPosFromLatLng(locations[Start_random?ii:pointsIndex].lat,locations[Start_random?ii:pointsIndex].lng,4.05);
			var position2=latlngPosFromLatLng(locations[ii+1].lat,locations[ii+1].lng,4.05);
			var _position1=new THREE.Vector3(position1.x,position1.y,position1.z);
			var _position2=new THREE.Vector3(position2.x,position2.y,position2.z);
			var length=new THREE.Vector3().subVectors(position1,position2).length()/2;
			lengthArr.push(length);
			var center=new THREE.Vector3().addVectors(position1,position2).multiplyScalar(.5);
			var Z=new THREE.Vector3().copy(position1).cross(position2).normalize();
			var X=new THREE.Vector3().subVectors(position1,position2).normalize();
	        var Y=new THREE.Vector3().copy(Z).cross(X).normalize();
	        var num=28;  
	        var _arr=[];
	        for(var i=0;i<=num;i++){
	        	_arr.push(new THREE.Vector3(X.x*Math.cos(i/num*Math.PI*2)+Y.x*Math.sin(i/num*Math.PI*2),
	        		                        X.y*Math.cos(i/num*Math.PI*2)+Y.y*Math.sin(i/num*Math.PI*2),
	        		                        X.z*Math.cos(i/num*Math.PI*2)+Y.z*Math.sin(i/num*Math.PI*2)
	                      ).multiplyScalar(length))
	        }
			var spline = new THREE.CatmullRomCurve3(_arr);
			splineArr.push(spline);
			var positions=[];
			var uvs=[],colors=[],sizes=[];
			var h = 0.2 * Math.random();
			var s = 0.5 + 0.5 * Math.random();
			var l = 0.5 + 0.5 * Math.random();
			for(var i=0;i<=fdNum;i++){
			   var vec=	spline.getPoint(i/fdNum);;
	           positions.push(vec.x,vec.y,vec.z); 
	           uvs.push((1-i/fdNum)*Math.PI/2,0.0);
			   var color=new THREE.Color().setHSL(h,s,l);
			   colors[ ( 3 * i )     ] = color.r;
			   colors[ ( 3 * i ) + 1 ] = color.g;
			   colors[ ( 3 * i ) + 2 ] = color.b;
			   sizes[ i ] = .2+Math.random();
			   sizesAll.push(.7)
			}
			var geometry=new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
			geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
			geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
			var uniforms = {
				time: {
					type: "f",
					value: 0.1
				}

			}
			uniformsArr.push(uniforms);
			var vertexShader="varying vec2 vUv;\n"+
	            "attribute vec3 customColor;\n"+
	            "varying vec3 vColor;\n"+
				"void main()	{\n"+
				"	vUv = uv;\n"+
				"	vColor=customColor;\n"+
				"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n"+
				"	gl_Position = projectionMatrix * mvPosition;\n"+
				"}";
			var fragmentShader=	"varying vec2 vUv;\n"+
	            "uniform float time;\n"+
	            "varying vec3 vColor;\n"+
				"void main()	{\n"+
				"	float aa=(vUv.x-.5+time);\n"+
				"	float dd=step(1.57,aa)*1.57;\n"+
				"	gl_FragColor = vec4(vColor, sin(dd) );\n"+
				"	// gl_FragColor = vec4(vColor, sin(2.0*(vUv.x*3.0+time)));\n"+
				"	gl_FragColor = vec4(vColor, 1.);\n"+
				"	// if(gl_FragColor.a < 0.5) discard;\n"+
				"}"
			var lineMaterial = new THREE.ShaderMaterial( {
				uniforms: uniforms,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				transparent: true,
			} );
			var line=new THREE.Line( geometry, lineMaterial  );
			line.position.copy(center)
			line.rotate_z=Z;
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
			var particles = new THREE.Points(geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) ), material );
			particlesArr.push(particles);
			line.add(particles);
	    }
	}

	this.addGui=function(){
		var API = {
					'Start random'    	: true,
					// 'Num random'		: true,
					'Num points'		: pointsNum,
				};
		var gui = new dat.GUI();
		gui.add( API, 'Start random' ).onChange( function() {
				Start_random = API[ 'show model' ];
				scope.addline_points();
		} );
		// gui.add( API, 'Num random' ).onChange( function() {
		// 		Num_random = API[ 'Num random' ];
		// 		scope.addline_points();
		// } );
		gui.add( API, 'Num points' ,40, 200, 1).onChange( function(val) {
				pointsNum=val;
				scope.addline_points();
		} );
	}
}
var globeObj=new Globe();
globeObj.init();
globeObj.animate();
globeObj.addGui();