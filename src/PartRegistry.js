import { Part } from "./Part";

//FIXME: how much of an overlap with bom ?
//FIXME: how much of an overlap with asset manager?
class PartRegistry{

  constructor(){
     //container for all already loaded meshes
    //TODO : should this be a facade ?
    this.partKlasses = {};
    this.parts = [];
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partMeshTemplates = {}; //the original base mesh: ONE PER PART
    this._partMeshWaiters  = {};//internal : when
    this.partMeshInstances = {};
  }
  
  /* 
    adds the "template mesh" for a given part
    this will be used as a basic instance to clone for all instances
    
    FIXME: is this no close to defining a class , of which all instances are...instances?
  */
  addTemplateMeshForPart( mesh, partId ){
    this._partMeshTemplates[ partId ] = mesh;
    
    //anybody waiting for that mesh yet ?
    if( this._partMeshWaiters[ partId ] ){
      console.log("resolving mesh of ", partId );
      this._partMeshWaiters[ partId ].resolve( mesh );
    }
  }
  
  
  /* wrapper abstracting whether one needs to wait for the part's mesh or not
  */
  *getEntityMesh( partId ){
    if( ! this.partMeshOriginal[ partId ] ) return;
    if( ! this._partMeshWaiters[ partId ] ) {
      this._partMeshWaiters[ partId ] = Q.defer();
    }
    
    //partMeshesToWaitFor.push( self.partWaiters[ partId ].promise );
    var mesh = yield this._partMeshWaiters[ partId ];
    return mesh
  }
  
  /* register a instance's 3d mesh
  this needs to be done PER INSTANCE not just once per part
  */
  registerInstanceMesh( mesh, partId ){
  
    //no partId was given, it means we have a mesh with no part (yet !)
    if( !partId ) {
      var part = new Part();
      part.pId = 0; //FIXME implement
      partId   = 0; //FIXME implement
      //TODO , should we be making a new part CLASS at this stage ?
    }else{
      part = this.parts[ partId ];
    } 
    
    if( !this.partMeshInstances[ partId ] )
    {
      this.partMeshInstances[ partId ] = [];
    }
    this.partMeshInstances[ partId ].push( mesh );
    
    //do we have ANY meshes for this part
    //if not, add it to templates
    if( ! this._partMeshTemplates[ partId ] ){
      this.addTemplateMeshForPart( mesh, partId );
    }
    
    //FIXME: unsure, this is both too three.js specific, and a bit weird to inject data like that
    mesh.userData.part = part;
    return part;
  }
  
  registerPart( part ){
    if( !part ) throw new Error("no part specified, cannot register part");
    this.parts.push( part );
  }
  /*
  registerPartKlass( partKlass ){
  
  }*/
}

export { PartRegistry };
