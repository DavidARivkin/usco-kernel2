
/* this is a proxy model /wrapper to be able to simplify 3d views/stream in
actual detailed 3d data at a later time*/

class ProxyModel extends THREE.Object3D{
  constructor( options ){
    super( options );
    
    this.boundingBox    = null;
	  this.boundingSphere = null;
	  
	  this.bbox = new THREE.BoxHelper( object );
	  
	  this.wrappedModel   = null;
  }


}


export { ProxyModel };
