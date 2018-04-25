onmessage = function (e) {
    for( var i = 0,j = e.data[0].length;i < j;i++){
		for(var ii = 0,jj = e.data[0][i].length;ii<jj;ii++){
			var particle = e.data[0][i][ii];
			var path = particle.path;
			particle.lerpN += 0.02;

			if(particle.lerpN >= 1){//currentPoint 索引值加1
				particle.lerpN = 0;
				particle.moveIndex = particle.nextIndex;
				particle.nextIndex++;
				if( particle.nextIndex >= e.data[1] ){
					// particle.moveIndex = 0;
					particle.nextIndex = 0;
				}
			}
			var num = ii+particle.moveIndex;//设置currentPoint的索引值
			if(num>=e.data[1]){//限制索引值范围
				num = ii+particle.moveIndex-e.data[1];
			}

			var currentPoint = {x:e.data[0][i][num].x,y:e.data[0][i][num].y,z:e.data[0][i][num].z};
			var nextPoint = {x:e.data[0][i][num+1>=e.data[1]?0:num+1].x,y:e.data[0][i][num+1>=e.data[1]?0:num+1].y,z:e.data[0][i][num+1>=e.data[1]?0:num+1].z};
			;

			// currentPoint.lerp( nextPoint, particle.lerpN );
			currentPoint.x += ( nextPoint.x - currentPoint.x ) * particle.lerpN;
			currentPoint.y += ( nextPoint.y - currentPoint.y ) * particle.lerpN;
			currentPoint.z += ( nextPoint.z - currentPoint.z ) * particle.lerpN;
			e.data[2][i*e.data[1]*3+ii*3]=currentPoint.x;
			e.data[2][i*e.data[1]*3+ii*3+1]=currentPoint.y;
			e.data[2][i*e.data[1]*3+ii*3+2]=currentPoint.z;
		}
	}
	postMessage(e.data[2]);
	// this.Pointsgeometry.attributes.position.needsUpdate = true;//更新缓存区顶点数据
};
