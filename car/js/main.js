var Car = function(){
	var camera, scene, renderer;
	var stats, Garage_group;
	var DirectionalLight, pointLight;
	var scope = this;
	var carobjArr = [], Mesh_rotate = [[],[],[]] ,Material_rim_arr=[];
	var wheelRadius = 72.7445023842048;//轮胎半径
	var Car_index = 0;
	var iswheelRotate = true;
	var Material_body, Material_glass, Material_bumper, Material_rim, Material_Bkg, meshBkg, Select_id;
	this.init = function() {
	    stats = new Stats();
		document.body.appendChild(stats.dom);
		scene = new THREE.Scene();
	    camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,12000);
	    DirectionalLight = new THREE.DirectionalLight(0xffffff,1.0);
	    DirectionalLight.position.set(0, 1, 0).normalize();
	    scene.add(DirectionalLight);
	    pointLight = new THREE.PointLight(0x666666,1.0);
	    scene.add(pointLight);
	    pointLight.decay = 2;
	    DirectionalLight.castShadow = true;
	    renderer = new THREE.WebGLRenderer({
	        antialias: true,
	        alpha: false
	    });
	    renderer.setClearColor(0x000000, 1);
	    renderer.setPixelRatio(window.devicePixelRatio);
	    renderer.setSize(window.innerWidth, window.innerHeight);
	    renderer.autoClear = false;
	    document.body.appendChild(renderer.domElement);
	 //    var bgTexture = this.loadEnvironment("css/cube/cheku/",".jpg")
		// scene.background=bgTexture;
		window.addEventListener( 'resize', this.onWindowResize, false );
		controls = new THREE.OrbitControls(camera,renderer.domElement);
	    camera.position.set(76, 364, 688);
	    controls.target.set(0, 50, 0);
	    controls.minDistance = 350;
	    controls.maxDistance = 750;
	    controls.autoRotate = true;
	    controls.enablePan = false;
	    controls.enabledAutoRotatePhi = true;
	    controls.autoRotateSpeed = 2.2;
	    controls.phiRotationSpeed = 2.2;
	    controls.minPolarAngle = THREE.Math.degToRad(70);
	    controls.maxPolarAngle = THREE.Math.degToRad(89);
	    controls.update();
		Garage_group = new THREE.Object3D();
		scene.add(Garage_group);
		this.loadmainBg();
		this.initCar();
		this.bindEvent();
	};

	this.initCar = function(){
		for(var i=0;i<3;i++){
			var carobj = new THREE.Object3D()
			scene.add(carobj);
			carobjArr.push(carobj);
		}
         var Car_brand=["lancer","audi","mercedes"];
         var Automotive_parts =
                        [
                            ["css/carVisual/carvisualizer.lancer_body.js","css/carVisual/carvisualizer.lancer_bumper.js","css/carVisual/carvisualizer.lancer_glass.js","css/carVisual/carvisualizer.lancer_interior.js","css/carVisual/carvisualizer.car_shadow.js"],
                            ["css/carVisual/carvisualizer.audi_body.js","css/carVisual/carvisualizer.audi_bumper.js","css/carVisual/carvisualizer.audi_glass.js","css/carVisual/carvisualizer.audi_interior.js","css/carVisual/carvisualizer.car_shadow.js"],
                            ["css/carVisual/carvisualizer.mercedes_body.js","css/carVisual/carvisualizer.mercedes_bumper.js","css/carVisual/carvisualizer.mercedes_glass.js","css/carVisual/carvisualizer.mercedes_interior.js","css/carVisual/carvisualizer.car_shadow.js"]
                        ];
       var Position_arr = [[new THREE.Vector3(146.4,0,257.0), new THREE.Vector3(-144.5,0,257.0), new THREE.Vector3(146.4,0,-255.5), new THREE.Vector3(-146.4,0,-255.5)], [new THREE.Vector3(137.5,0,233.5), new THREE.Vector3(-138.5,0,233.5), new THREE.Vector3(137.5,0,-267.5), new THREE.Vector3(-138.5,0,-267.5)], [new THREE.Vector3(154.5,0,268.6), new THREE.Vector3(-155.5,0,268.6), new THREE.Vector3(154.5,0,-261.8), new THREE.Vector3(-155.5,0,-261.8)]];
  //       var Material_Bkg = [];
  //       var textures =
	 //            [
	 //               "css/cube/Garage/px.jpg",
  //                  "css/cube/Garage/nx.jpg",
  //                  "css/cube/Garage/py.jpg",
  //                  "css/cube/Garage/ny.jpg",
  //                  "css/cube/Garage/pz.jpg",
  //                  "css/cube/Garage/nz.jpg"
	 //            ];
		// for ( var i = 0; i < 6; i ++ ) {

		// 	Material_Bkg.push( new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load(textures[i])  } ) );

		// }
		// // this.loadEnvironment2("css/cube/Garage/",".jpg");
		// meshBkg = new THREE.Mesh( new THREE.CubeGeometry( 1500, 1500, 1500 ), Material_Bkg );
		// meshBkg.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, - 1 ) );
		// scene.add( meshBkg );
		// meshBkg.position.y = 750;
        var textureCube_env = this.loadEnvironment("css/cube/Garage/",".jpg");
       
        Material_Bkg = new THREE.ShaderMaterial({
	        uniforms: {
	            "tCube": textureCube_env
	        },
	        vertexShader: "varying vec2 outUV;void main(){outUV=uv;vec4 mvPosition = modelViewMatrix*vec4(position,1.0 );gl_Position = projectionMatrix * mvPosition;}",
	        fragmentShader: "uniform samplerCube tCube;varying vec2 outUV;vec4 cubeToLatLon(samplerCube cubemap, vec2 inUV){const float PI = 3.141592653589793238462643383;vec3 cubmapTexCoords;cubmapTexCoords.x = -cos(inUV.x * PI * 2.0) * sin(inUV.y * PI);cubmapTexCoords.y = -cos(inUV.y * PI);cubmapTexCoords.z = -sin(inUV.x * PI * 2.0) * sin(inUV.y * PI);return textureCube(cubemap, cubmapTexCoords);}void main( void ){gl_FragColor = cubeToLatLon(tCube, outUV);}"
	    });
	    var TextureLoader = new THREE.TextureLoader();
	    var BinaryLoader = new THREE.BinaryLoader();
	    BinaryLoader.load("css/cube/Road/environment.js", function(_model) {
	        meshBkg = new THREE.Mesh(_model,Material_Bkg);
	        scene.add(meshBkg);
	        meshBkg.visible = false
	    });
        Material_body = new THREE.MeshPhongMaterial({//车身
	        color: 0xff0000,
	        reflectivity: 0.6,
	        combine: THREE.MixOperation,//影响环境贴图颜色混合方式
	        envMap: textureCube_env,
	        shininess: 60
	    });
	    Material_glass = new THREE.MeshPhongMaterial({//车窗
	        color: 0xcccccc,
	        reflectivity: 1.0,
	        opacity: 0.1,
	        transparent: true,
	        combine: THREE.MixOperation,
	        envMap: textureCube_env,
	        depthWrite: false
	    });
	    Material_bumper = new THREE.MeshLambertMaterial({//保险杠
	        color: 0x333333,
	        reflectivity: 0.5,
	        combine: THREE.MixOperation,
	        envMap: textureCube_env
	    });
	    var TextureLoader_car = new THREE.TextureLoader().load("css/carVisual/images/i_" + Car_brand[0] + ".jpg");
        TextureLoader_car.anisotropy = 8;
        var Material_interior = new THREE.MeshBasicMaterial({map:TextureLoader_car});
        var Material_floor = new THREE.MeshBasicMaterial({
            transparent: true,
            depthWrite: false,
            map: new THREE.TextureLoader().load("css/carVisual/images/s_" + Car_brand[0] + ".png")
        });
        Material_floor.name = "shadow";
        var _material=[Material_body,Material_bumper,Material_glass,Material_interior,Material_floor];

        for(var j=0, jj=Automotive_parts.length; j<jj; j++){
        	for(var i=0, ii=_material.length; i<ii; i++){
	            this.loadModel(Automotive_parts[j][i],_material[i],j)
	        }
	        var Wheel_texture = new THREE.TextureLoader().load("css/carVisual/images/wheel.png");
		    Wheel_texture.anisotropy = 8;
		    var Material_wheel = new THREE.MeshBasicMaterial({//车轮
		        map: Wheel_texture,
		        transparent: true
		    });
		    var Material_rim = new THREE.MeshPhongMaterial({//轮缘
		        color: 0xb8b8b8,
		        reflectivity: 0.5,
		        combine: THREE.MixOperation,
		        envMap: textureCube_env,
		        specular: 0x202020
		    });
		    Material_rim_arr.push(Material_rim)
	        this.loadTyreRim("css/carVisual/carvisualizer.wheel.js", Material_wheel, Position_arr[j], j);
	        this.loadTyreRim("css/carVisual/carvisualizer.rim.js", Material_rim, Position_arr[j], j);
        }

	}

	this.loadModel=function(_url, _material, _index){
        var JSONLoader = new THREE.JSONLoader();
	    JSONLoader.load(_url, function(geometry) {
	        var Mesh = new THREE.Mesh(geometry,_material);
	        Mesh.castShadow = false;
	        Mesh.receiveShadow = true;
	        carobjArr[_index].add(Mesh);
	        if(_index>0){
	        	carobjArr[_index].visible = false;
	        }
	    })
	};

    this.loadEnvironment=function(_path, _format, _callback) {
	    var Pic_arr =
	            [
	               _path + "px" + _format,
                   _path + "nx" + _format,
                   _path + "py" + _format,
                   _path + "ny" + _format,
                   _path + "pz" + _format,
                   _path + "nz" + _format
	            ];
	    var CubeTextureLoader = new THREE.CubeTextureLoader();
	    textureCube = CubeTextureLoader.load(Pic_arr,_callback);
	    textureCube.format = THREE.RGBFormat;
	    return textureCube
	};

	this.changeEnvironment2=function(_path, _format, _change) {
	    var Pic_arr =
	            [
	               _path + "px" + _format,
                   _path + "nx" + _format,
                   _path + "py" + _format,
                   _path + "ny" + _format,
                   _path + "pz" + _format,
                   _path + "nz" + _format
	            ];
	    for ( var i = 0; i < 6; i ++ ) {
	    	meshBkg.material[i].map = new THREE.TextureLoader().load(Pic_arr[i]);
			meshBkg.material[i].needsUpdate=true;
		}
	};

	this.addGui=function(){
		var API = {
					'车身-color'    	: 0xff0000,
					'车身-reflectivity'		: .6,
					'车身-combine'		: "THREE.MixOperation",
					'车身-shininess'		: 60,
					'车窗-color'    	: 0xcccccc,
					'车窗-reflectivity'		: 1.0,
					'车窗-opacity'		: .1,
					'车窗-combine'		: "THREE.MixOperation",
					'轮胎运动'    	: true,
					'轮毂颜色'   : 0xb8b8b8,
				};
		var gui = new dat.GUI();
		gui.addColor( API, '车身-color' ).onChange( function(val) {
				Material_body.color.setHex( val );
		} );

		gui.add( API, '车身-reflectivity', .1, 1, .05 ).onChange( function(val) {
				Material_body.reflectivity = val;
		} );

		gui.add( API, '车身-shininess', 20, 200, 1).onChange( function(val) {
				Material_body.shininess = val;
		} );

		gui.add(API, '车身-combine', [ 'THREE.MixOperation', 'THREE.MultiplyOperation', 'THREE.AddOperation' ]).onChange( function(val) {
			if(val === "THREE.MixOperation"){
                Material_body.combine = THREE.MixOperation;
			}else if(val === "THREE.MultiplyOperation"){
                Material_body.combine = THREE.MultiplyOperation;
			}else if(val === "THREE.AddOperation"){
                Material_body.combine = THREE.AddOperation;
			}
			Material_body.needsUpdate=true;
		} );;

		gui.addColor( API, '车窗-color' ).onChange( function(val) {
				Material_glass.color.setHex( val );
		} );

		gui.add( API, '车窗-reflectivity', .1, 1, .05 ).onChange( function(val) {
				Material_glass.reflectivity = val;
		} );

	 	gui.add( API, '车窗-opacity', .1, 1, .05).onChange( function(val) {
				Material_glass.opacity = val;
		} );

		gui.add(API, '车窗-combine', [ 'THREE.MixOperation', 'THREE.MultiplyOperation', 'THREE.AddOperation' ]).onChange( function(val) {
			if(val === "THREE.MixOperation"){
                Material_glass.combine = THREE.MixOperation;
			}else if(val === "THREE.MultiplyOperation"){
                Material_glass.combine = THREE.MultiplyOperation;
			}else if(val === "THREE.AddOperation"){
                Material_glass.combine = THREE.AddOperation;
			}
			Material_glass.needsUpdate=true;
		} );;

		gui.addColor( API, '轮毂颜色' ).onChange( function(val) {
				Material_rim_arr[Car_index].color.setHex( val );
		} );

		// Material_rim = new THREE.MeshPhongMaterial({//轮缘
		//         color: 0xb8b8b8,
		//         reflectivity: 0.5,
		//         combine: THREE.MixOperation,
		//         envMap: textureCube_env,
		//         specular: 0x202020
		//     });

		gui.add( API, '轮胎运动' ).onChange( function(val) {
				iswheelRotate = val;
		} );

	    $(".ac").css({"z-index":100})
	}

	this.bindEvent = function(){
        document.getElementById("Lancer").onclick = function(){
        	scope.changeSel_car(this.parentElement.id,this.getAttribute("num"))
        };

        document.getElementById("Audi").onclick = function(){
        	scope.changeSel_car(this.parentElement.id,this.getAttribute("num"))
        };

        document.getElementById("Mercedes").onclick = function(){
        	scope.changeSel_car(this.parentElement.id,this.getAttribute("num"))
        };

        document.getElementById("Garage").onclick = function(){
            scope.changeSel_material(this.id)
        };

        document.getElementById("Meadow").onclick = function(){
            scope.changeSel_material(this.id)
        };

        document.getElementById("Road").onclick = function(){
            scope.changeSel_material(this.id)
        };

        document.getElementById("Snowfield").onclick = function(){
            scope.changeSel_material(this.id)
        };

        document.getElementById("Castle").onclick = function(){
            scope.changeSel_material(this.id)
        };

	};

	this.changeSel_car = function(_id,_index){
		_index*=1;
        $("#"+_id).children().removeClass("select");
        $("#"+_id+" :eq("+_index+")").addClass("select");
        for(var i=0, j=carobjArr.length; i<j; i++){
            carobjArr[i].visible = false;
        }
    	carobjArr[_index].visible = true;
        Car_index = _index;
        //轮胎显示隐藏状态调整
    	for(var i=0, j=Mesh_rotate.length; i<j; i++){
			for(var ii=0, jj=Mesh_rotate[i].length; ii<jj; ii++){
				if(i===_index){
					Mesh_rotate[i][ii].visible = true;
				}else{
					Mesh_rotate[i][ii].visible = true;
				}
			}
		}
	}

	this.changeSel_material = function(_id){
		Select_id = _id;
		$("#"+_id).parent().children().removeClass("select");
        $("#"+_id).addClass("select");
        this.loadEnvironment("css/cube/"+_id+"/",".jpg",this.changeSel_material2);
	}

	this.changeSel_material2 = function(_textureCube_env){
		scope.removeCache([Material_Bkg.uniforms["tCube"],Material_body.envMap,Material_glass.envMap,Material_bumper.envMap,Material_rim_arr[Car_index].envMap]);
        if(Select_id==="Garage"){
        	Garage_group.visible = true;
        	meshBkg.visible = false;
        }else{
        	Garage_group.visible = false;
        	// this.changeEnvironment2("css/cube/"+_id+"/",".jpg")
        	meshBkg.visible = true;
        	Material_Bkg.uniforms["tCube"].value = _textureCube_env
        }
        Material_body.reflectivity = 0.4;
        Material_body.combine = THREE.AddOperation;
        Material_body.envMap = _textureCube_env;
        Material_glass.envMap = _textureCube_env;
        Material_bumper.envMap = _textureCube_env;
        Material_rim_arr[Car_index].envMap = _textureCube_env;
	}

	this.unbindEvent = function(){
        document.getElementById("Lancer").onclick = null;

        document.getElementById("Audi").onclick = null;

        document.getElementById("Mercedes").onclick = null;

        document.getElementById("Garage").onclick = null;

        document.getElementById("Meadow").onclick = null;

        document.getElementById("Road").onclick = null;

        document.getElementById("Snowfield").onclick = null;

        document.getElementById("Castle").onclick = null;
	};

	this.loadTyreRim = function(_url, _material, _position, _index) {
	    var JSONLoader = new THREE.JSONLoader();
	    JSONLoader.load(_url, function(_geometry) {
	    	for(var i=0; i<4; i++){
	    		var Parent_rotate = new THREE.Object3D();//由于轮胎的模型坐标原点在底部正中间不能绕中心点旋转 使用父级对象 旋转
				Parent_rotate.position.copy(_position[i]);
				Parent_rotate.position.y += wheelRadius;//轮胎的半径
				Parent_rotate.name = "wheel"+(_index+1);
				carobjArr[_index].add( Parent_rotate );
	            Mesh_rotate[_index].push(Parent_rotate);
	    		var Mesh = new THREE.Mesh(_geometry.clone(),_material);
	            Mesh.position.y -= wheelRadius;//轮胎的模型坐标原点在底部正中间
	            Parent_rotate.add(Mesh)
	            if(i==0||i==2){
	            	Mesh.rotation.y = THREE.Math.degToRad(180);
	            };
	            if(_index>0){
	            	Parent_rotate.visible = false;
	            }

	    	}
	    })
    };

    this.loadmainBg = function() {
	    var TextureLoader = new THREE.TextureLoader();
	    var JSONLoader = new THREE.JSONLoader();
	    var Texture_garbage = TextureLoader.load("css/carVisual/images/garage.jpg");
	    Texture_garbage.anisotropy = 8;
	    var Material_garbage = new THREE.MeshBasicMaterial({
	        map: Texture_garbage
	    });
	    JSONLoader.load("css/carVisual/carvisualizer.garage.js", function(material) {
	        var Mesh_garage = new THREE.Mesh(material,Material_garbage);
	        Garage_group.add(Mesh_garage)
	    });
	    var Texture_floor = TextureLoader.load("css/carVisual/images/floor.jpg");
	    Texture_floor.anisotropy = 16;
	    Texture_floor.wrapS = Texture_floor.wrapT = THREE.RepeatWrapping;
	    Texture_floor.repeat.set(10, 10);
	    var Material_floor = new THREE.MeshLambertMaterial({
	        map: Texture_floor
	    });
	    JSONLoader.load("css/carVisual/carvisualizer.floor.js", function(material) {
	        var Mesh_floor = new THREE.Mesh(material,Material_floor);
	        Garage_group.add(Mesh_floor)
	    });
	    var Texture_floorShadow = TextureLoader.load("css/carVisual/images/floorShadow.png");
	    var Material_floorShadow = new THREE.MeshBasicMaterial({
	        map: Texture_floorShadow,
	        transparent: true,
	        depthWrite: false
	    });
	    JSONLoader.load("css/carVisual/carvisualizer.floor_shadow.js", function(material) {
	        var Mesh_floor_shadow = new THREE.Mesh(material,Material_floorShadow);
	        Garage_group.add(Mesh_floor_shadow)
	    })
    };

    this.onWindowResize = function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	this.animate = function() {
		pointLight.position.copy(camera.position);
		scope.wheelRun();
		stats.update();
		// controls.update();
		renderer.render( scene, camera );
		requestAnimationFrame( scope.animate );
	};

	this.wheelRun = function(){
		if(iswheelRotate){
            for(var i=0, j=Mesh_rotate.length; i<j; i++){
				for(var ii=0, jj=Mesh_rotate[i].length; ii<jj; ii++){
					if(Mesh_rotate[i][ii]){
						Mesh_rotate[i][ii].rotation.x+=.01;
					}
				}
			}
		}
	}

	this.removeCache = function(_cache) {
		for(var i = 0, j=_cache.length; i<j; i++){
			_cache[i].dispose();
		}
	};
}
var Carobj=new Car();
Carobj.init();
Carobj.animate();
Carobj.addGui();