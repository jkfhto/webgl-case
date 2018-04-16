var Globe = function(){
	var camera, scene, renderer;
	var DirectionalLight;
	var cloudsphere, pointsNum=20, fdNum=150, pointsSize=.1;
	var earthSphere, stats;
	var uniformsArr=[], splineArr=[], lengthArr=[], particlesArr=[], lineArr=[], pointsIndex=0;
	var Start_random=false, Rotate_points=false;
	var mouse = new THREE.Vector2(), INTERSECTED, raycaster, mapContext;
	var lookupContext, lookupTexture;
	var scope=this;
	//记录每个国家对应的颜色值
	var countryColorMap = {'PE':1,
		'BF':2,'FR':3,'LY':4,'BY':5,'PK':6,'ID':7,'YE':8,'MG':9,'BO':10,'CI':11,'DZ':12,'CH':13,'CM':14,'MK':15,'BW':16,'UA':17,
		'KE':18,'TW':19,'JO':20,'MX':21,'AE':22,'BZ':23,'BR':24,'SL':25,'ML':26,'CD':27,'IT':28,'SO':29,'AF':30,'BD':31,'DO':32,'GW':33,
		'GH':34,'AT':35,'SE':36,'TR':37,'UG':38,'MZ':39,'JP':40,'NZ':41,'CU':42,'VE':43,'PT':44,'CO':45,'MR':46,'AO':47,'DE':48,'SD':49,
		'TH':50,'AU':51,'PG':52,'IQ':53,'HR':54,'GL':55,'NE':56,'DK':57,'LV':58,'RO':59,'ZM':60,'IR':61,'MM':62,'ET':63,'GT':64,'SR':65,
		'EH':66,'CZ':67,'TD':68,'AL':69,'FI':70,'SY':71,'KG':72,'SB':73,'OM':74,'PA':75,'AR':76,'GB':77,'CR':78,'PY':79,'GN':80,'IE':81,
		'NG':82,'TN':83,'PL':84,'NA':85,'ZA':86,'EG':87,'TZ':88,'GE':89,'SA':90,'VN':91,'RU':92,'HT':93,'BA':94,'IN':95,'CN':96,'CA':97,
		'SV':98,'GY':99,'BE':100,'GQ':101,'LS':102,'BG':103,'BI':104,'DJ':105,'AZ':106,'MY':107,'PH':108,'UY':109,'CG':110,'RS':111,'ME':112,'EE':113,
		'RW':114,'AM':115,'SN':116,'TG':117,'ES':118,'GA':119,'HU':120,'MW':121,'TJ':122,'KH':123,'KR':124,'HN':125,'IS':126,'NI':127,'CL':128,'MA':129,
		'LR':130,'NL':131,'CF':132,'SK':133,'LT':134,'ZW':135,'LK':136,'IL':137,'LA':138,'KP':139,'GR':140,'TM':141,'EC':142,'BJ':143,'SI':144,'NO':145,
		'MD':146,'LB':147,'NP':148,'ER':149,'US':150,'KZ':151,'AQ':152,'SZ':153,'UZ':154,'MN':155,'BT':156,'NC':157,'FJ':158,'KW':159,'TL':160,'BS':161,
		'VU':162,'FK':163,'GM':164,'QA':165,'JM':166,'CY':167,'PR':168,'PS':169,'BN':170,'TT':171,'CV':172,'PF':173,'WS':174,'LU':175,'KM':176,'MU':177,
		'FO':178,'ST':179,'AN':180,'DM':181,'TO':182,'KI':183,'FM':184,'BH':185,'AD':186,'MP':187,'PW':188,'SC':189,'AG':190,'BB':191,'TC':192,'VC':193,
		'LC':194,'YT':195,'VI':196,'GD':197,'MT':198,'MV':199,'KY':200,'KN':201,'MS':202,'BL':203,'NU':204,'PM':205,'CK':206,'WF':207,'AS':208,'MH':209,
		'AW':210,'LI':211,'VG':212,'SH':213,'JE':214,'AI':215,'MF_1_':216,'GG':217,'SM':218,'BM':219,'TV':220,'NR':221,'GI':222,'PN':223,'MC':224,'VA':225,
		'IM':226,'GU':227,'SG':228
    };
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


		var earthGeometry = new THREE.SphereGeometry( 4, 40, 40 );
		var map = new THREE.TextureLoader().load( "css/earth_surface.jpg" );
		var normalMap = new THREE.TextureLoader().load( "css/earth_normals.jpg" );
		var specularMap = new THREE.TextureLoader().load( "css/earth_specular.jpg" );
		var earthMaterial = new THREE.MeshPhongMaterial( {
			specular: 0x222222,
			shininess: 25,
			map: map,
			normalMap:normalMap,
			specularMap:specularMap,
		} );
		earthSphere = new THREE.Mesh( earthGeometry, earthMaterial );
		scene.add( earthSphere );

		var outlineGeometry = new THREE.SphereGeometry( 4, 40, 40 );
		var alphaMap = new THREE.TextureLoader().load( "css/earth-outline-shifted-gray.png" );
		var outlineMaterial = new THREE.MeshBasicMaterial( {
			alphaMap:alphaMap,
			alphaTest:.05,
		} );
		outlineSphere = new THREE.Mesh( outlineGeometry, outlineMaterial );
		// scene.add( outlineSphere );

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

		raycaster = new THREE.Raycaster();

		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		document.body.appendChild( renderer.domElement );
		controls=new THREE.OrbitControls(camera,renderer.domElement);
		window.addEventListener( 'resize', this.onWindowResize, false );

		createMap();
		createlookupMap();
	}

	this.onWindowResize = function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	this.animate = function() {
		stats.update();
		DirectionalLight.position.copy(camera.position);
		cloudsphere.rotation.y+=.001;
		// earthSphere.rotation.y+=.0005;
		var time = Date.now();
		var looptime = 20 * 100;//设置速度
		var t = ( time % looptime ) / looptime;//限制在[0,1]范围
		// var tt = ( time % looptime ) ;
		if(Rotate_points){
			for(var i=0;i<pointsNum/2;i++){
				uniformsArr[i].time.value +=lengthArr[i]/500 ;
				var axis = new THREE.Vector3().copy(lineArr[i].rotate_z);//向量axis
		        lineArr[i].rotateOnAxis(axis,.01)
			}
		}
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
		// var positionsAll=[],uvsAll=[],colorsAll=[],sizesAll=[];
	    for(var ii=0;ii<pointsNum;ii+=2){
	    	var dd=ii%300;
	    	var position1=latlngPosFromLatLng(locations[Start_random?dd:pointsIndex].lat,locations[Start_random?dd:pointsIndex].lng,4.05);
			var position2=latlngPosFromLatLng(locations[dd+1].lat,locations[dd+1].lng,4.05);
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
	        	_arr.push(new THREE.Vector3(
		        		      X.x*Math.cos(i/num*Math.PI*2)+Y.x*Math.sin(i/num*Math.PI*2),
		        		      X.y*Math.cos(i/num*Math.PI*2)+Y.y*Math.sin(i/num*Math.PI*2),
		        		      X.z*Math.cos(i/num*Math.PI*2)+Y.z*Math.sin(i/num*Math.PI*2)).multiplyScalar(length)
	                    )
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
			   sizes[ i ] = pointsSize+Math.random();
			   // sizesAll.push(.7)
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
				"	//float aa=(vUv.x-.5+time);\n"+
				"	//float dd=step(1.57,aa)*1.57;\n"+
				"	//gl_FragColor = vec4(vColor, sin(dd) );\n"+
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
					'Start random'    	: false,
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
		gui.add( API, 'Num points' ,20, 200, 2).onChange( function(val) {
				pointsNum=val;
				scope.addline_points();
		} );
		gui.add( API, 'Size points' ,.1, 1, .1).onChange( function(val) {
				pointsSize=val;
				scope.addline_points();
		} );
	}

	function mouseMove( event ) {
		mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	function mouseClick( event ) {
		mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		var countryCode = -1;
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( [earthSphere] );
		if (intersects.length > 0 )
		{
			data = intersects[0];
			var d = data.point.clone().normalize();
			//球面坐标转平面坐标 获取指定平面坐标对应的颜色值 找到对应的国家
			var u = Math.round(4096 * (1 - (0.5 + Math.atan2(d.z, d.x) / (2 * Math.PI))));
			var v = Math.round(2048 * (0.5 - Math.asin(d.y) / Math.PI));
			var p = mapContext.getImageData(u,v,1,1).data;
			countryCode = p[0];

			for( var prop in countryColorMap ) {
		        if( countryColorMap.hasOwnProperty( prop ) ) {
		             if( countryColorMap[ prop ] === countryCode )
		                 console.log(prop, countryCode);
					}
			}

			lookupContext.clearRect(0,0,256,1);

			for (var i = 0; i < 228; i++)
			{
				if (i == 0) 
					lookupContext.fillStyle = "rgba(0,0,0,1.0)"
				else if (i == countryCode)
					lookupContext.fillStyle = "rgba(50,50,0,0.5)"
				else
					lookupContext.fillStyle = "rgba(0,0,0,1.0)"

				lookupContext.fillRect( i, 0, 1, 1 );
			}

			lookupTexture.needsUpdate = true;
		}

	}

	function createMap(){
		var mapCanvas = document.createElement('canvas');
		mapCanvas.width = 4096;
		mapCanvas.height = 2048;
	    mapContext = mapCanvas.getContext('2d');
	    var imageObj = new Image();
	    imageObj.onload = function() 
		{
	        mapContext.drawImage(imageObj, 0, 0);
	        document.addEventListener( 'mousemove', mouseMove, false );
		    document.addEventListener( 'mousedown', mouseClick, false );
	    };
	    imageObj.src = 'css/earth-index-shifted-gray.png';
	}

	function createlookupMap(){
		var lookupCanvas = document.createElement('canvas');	
		lookupCanvas.width = 256;
		lookupCanvas.height = 1;
		lookupContext = lookupCanvas.getContext('2d');
		lookupTexture = new THREE.Texture( lookupCanvas );
		lookupTexture.magFilter = THREE.NearestFilter;
		lookupTexture.minFilter = THREE.NearestFilter;
		lookupTexture.needsUpdate = true;
	}
}
var globeObj=new Globe();
globeObj.init();
globeObj.animate();
globeObj.addGui();