// Adapted from --> The Nature of Code, by Daniel Shiffman
// http://natureofcode.com


function Light(x,y,z,texture){
	this.position = new THREE.Vector3(x, y, z);
	this.acceleration = new THREE.Vector3(0,0,0);
	this.velocity = new THREE.Vector3(0,0,0);

	this.r = 0.6;
	this.maxSpeed = 0.3;
	this.maxForce = 0.01;
	this.maxForceSelf = 0.0001;
	this.texture = texture;



	//CREATE_LIGHT_BULBS
    this.bulbGeo = new THREE.SphereGeometry(0.5, 32, 32);
    this.mat = new THREE.MeshBasicMaterial( {color: 0xffef3b} );
    this.mesh = new THREE.Mesh(this.bulbGeo, this.mat);
    this.pointL = new THREE.PointLight( 0xffef3b, 0.5, 10 );

    this.pointL.add(this.mesh);

	this.glowMat = new THREE.SpriteMaterial(
	      {
	        map: this.texture,
	        color: 0xffef3b, transparent: false, blending: THREE.AdditiveBlending
	      });
	this.glow = new THREE.Sprite(this.glowMat);
	// this.glow.scale.set(6.4, 6.4, 6.4);	//big
	this.glow.scale.set(3,3,3);	//big
	this.pointL.add(this.glow);

	this.pointL.position.copy(this.position);

	scene.add(this.pointL);

}

Light.prototype.update = function(){
	this.velocity.add(this.acceleration);
	this.velocity.clampScalar(-4,4);
	this.position.add(this.velocity);
	this.acceleration.multiplyScalar(0);

	// this.position.y += Math.cos(timeNow*10)*0.01;

	this.pointL.position.copy(this.position);
}

Light.prototype.applyForce = function(force){
	this.acceleration.add(force);
}

Light.prototype.separate = function(lights) {
	var desiredseparation = this.r*2;
	var sum = new THREE.Vector3();
	var count = 0;

	var diff = new THREE.Vector3();
	var steer = new THREE.Vector3();

	// check if they're too close
	for(var i=0; i<lights.length; i++){
		var d = this.position.distanceTo(lights[i].position);
		if( (d>0) && (d<desiredseparation) ){
			diff.subVectors(this.position, lights[i].position);
			diff.normalize();
			diff.divideScalar(d);
			sum.add(diff);
			count++;
		}
	}

	// average
	if(count>0){
		sum.divideScalar(count);
		sum.normalize();
		sum.multiplyScalar(this.maxSpeed);

		steer.subVectors(sum, this.velocity);
		steer.clampScalar(-500, this.maxForceSelf);
		this.applyForce(steer);
	}
}

Light.prototype.seek = function(target){
	var desired = new THREE.Vector3();
	desired.subVectors(target.position(), this.position);

	desired.setLength(this.maxSpeed);

	var steer = new THREE.Vector3();
	steer.subVectors(desired, this.velocity);

	if( steer.lengthSq()>(this.maxForce*this.maxForce) ){
		steer.divideScalar(Math.sqrt(steer.lengthSq()));
		steer.multiplyScalar(this.maxForce);
	}

	this.applyForce(steer);
}

Light.prototype.arrive = function(target){
	var desired = new THREE.Vector3();
	desired.subVectors(target.position(), this.position);

	var d = desired.length();

	// if(d<5.1) {
	// 	console.log("too close!");
	// 	sample.trigger(0);
	// }

	if(d<10){
		var m = map_range(d, 0, 100, 0, this.maxSpeed);
		desired.setLength(m);
	} else {
		desired.setLength(this.maxSpeed);
	}

	var steer = new THREE.Vector3();
	steer.subVectors(desired, this.velocity);

	if( steer.lengthSq()>(this.maxForce*this.maxForce) ){
		steer.divideScalar(Math.sqrt(steer.lengthSq()));
		steer.multiplyScalar(this.maxForce);
	}

	this.applyForce(steer);
}