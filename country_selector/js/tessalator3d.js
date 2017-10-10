// originally from https://github.com/udmani/tessalator/
function Tessalator3D(data) {//通过边界经纬度坐标构建国家
  THREE.Geometry.call(this);
  var i, uvs = [];
  var inner_radius = 0.78;
  for (i = 0; i < data.vertices.length; i += 2) {//将经纬度坐标转为球面坐标
    var lon = data.vertices[i];//经度
    var lat = data.vertices[i + 1];//纬度
    var phi = +(90.0 - lat) * Math.PI / 180.0;//纬度范围[-90,90];
    var the = +(180.0 - lon) * Math.PI / 180.0;//经度范围[-180,180];
    var wx = Math.sin(the) * Math.sin(phi) * -1;//获取球面上点的x坐标
    var wz = Math.cos(the) * Math.sin(phi);//获取球面上点的z坐标
    var wy = Math.cos(phi);//获取球面上点的y坐标
    var wu = 0.25 + lon / 360.0;//设置纹理坐标u
    var wv = 0.50 + lat / 180.0;//设置纹理坐标v
    this.vertices.push(new THREE.Vector3(wx, wy, wz));
    uvs.push(new THREE.Vector2(wu, wv))
  }
  var n = this.vertices.length;
  if (inner_radius <= 1) {
    for (i = 0; i < n; i++) {
      var v = this.vertices[i];
      this.vertices.push(v.clone()
        .multiplyScalar(inner_radius))
    }
  }
  for (i = 0; i < data.triangles.length; i += 3) {//根据data.triangles数据绘制国家
    var a = data.triangles[i];
    var b = data.triangles[i + 1];
    var c = data.triangles[i + 2];
    this.faces.push(new THREE.Face3(a, b, c, [this.vertices[a], this.vertices[b], this.vertices[c]]));
    this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[c]]);
    if ((0 < inner_radius) && (inner_radius <= 1)) {//绘制国家背面
      this.faces.push(new THREE.Face3(n + b, n + a, n + c, [this.vertices[b].clone()
        .multiplyScalar(-1), this.vertices[a].clone()
        .multiplyScalar(-1), this.vertices[c].clone()
        .multiplyScalar(-1)
      ]));
      this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[c]])
    }
  }
  if (inner_radius < 1) {//连接国家正面，背面实现立体效果
    for (i = 0; i < data.polygons.length; i++) {
      var polyWithHoles = data.polygons[i];
      for (var j = 0; j < polyWithHoles.length; j++) {
        var polygonOrHole = polyWithHoles[j];
        for (var k = 0; k < polygonOrHole.length; k++) {
          var a = polygonOrHole[k],
            b = polygonOrHole[(k + 1) % polygonOrHole.length];
          var va1 = this.vertices[a],
            vb1 = this.vertices[b];
          var va2 = this.vertices[n + a],
            vb2 = this.vertices[n + b];
          var normal;
          if (j < 1) {
            normal = vb1.clone()
              .sub(va1)
              .cross(va2.clone()
                .sub(va1))
              .normalize();
            this.faces.push(new THREE.Face3(a, b, n + a, [normal, normal, normal]));
            this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[a]]);
            if (inner_radius > 0) {
              this.faces.push(new THREE.Face3(b, n + b, n + a, [normal, normal, normal]));
              this.faceVertexUvs[0].push([uvs[b], uvs[b], uvs[a]])
            }
          } else {
            normal = va2.clone()
              .sub(va1)
              .cross(vb1.clone()
                .sub(va1))
              .normalize();
            this.faces.push(new THREE.Face3(b, a, n + a, [normal, normal, normal]));
            this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[a]]);
            if (inner_radius > 0) {
              this.faces.push(new THREE.Face3(b, n + a, n + b, [normal, normal, normal]));
              this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[b]])
            }
          }
        }
      }
    }
  }
  this.computeFaceNormals();
  this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1)
}
Tessalator3D.prototype = Object.create(THREE.Geometry.prototype);