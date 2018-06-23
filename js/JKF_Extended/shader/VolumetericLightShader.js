THREE = THREE || {};

THREE.VolumetericLightShader = {
	uniforms: {
	    tDiffuse: {value:null},
	    lightPosition: {value: new THREE.Vector2(0.5, 0.5)},
	    exposure: {value: 0.18},
	    decay: {value: 0.95},
	    density: {value: 0.8},
	    weight: {value: 0.4},
	    samples: {value: 50}
	},

	vertexShader: [
	    "varying vec2 vUv;",
	    "void main() {",
	      "vUv = uv;",
	      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	    "}"
	].join("\n"),

	fragmentShader: [
	    "varying vec2 vUv;",
	    "uniform sampler2D tDiffuse;",
	    "uniform vec2 lightPosition;",
	    "uniform float exposure;",
	    "uniform float decay;",
	    "uniform float density;",
	    "uniform float weight;",
	    "uniform int samples;",
	    "const int MAX_SAMPLES = 100;",
	    "void main()",
	    "{",//径向模糊
		    "vec2 texCoord = vUv;",
		    "vec2 deltaTextCoord = texCoord - lightPosition;",//计算屏幕空间中从像素到光源的向量
		    "deltaTextCoord *= 1.0 / float(samples) * density;",//通过采样的数目划分以及通过控制因子缩放
		    "vec4 color = texture2D(tDiffuse, texCoord);",//获取默认颜色值
		    "float illuminationDecay = 1.0;",//设置光照衰减因子
		    "for(int i=0; i < MAX_SAMPLES; i++)",
		        "{",
			        "if(i == samples){",
			          "break;",
			        "}",
			        "texCoord -= deltaTextCoord;",//沿光线方向便利采样位置
			        "vec4 sample = texture2D(tDiffuse, texCoord);",
			        "sample *= illuminationDecay * weight;",
			        "color += sample;",//累加混合的颜色
			        "illuminationDecay *= decay;",//更新指数的衰减因子
		        "}",
		    "gl_FragColor = color * exposure;",//使用缩放控制因子输出最终颜色
	    "}"
	].join("\n")
};