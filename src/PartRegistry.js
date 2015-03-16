import { generateUUID } from "./utils";
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
    if( ! this._partMeshTemplates[ partId ] ) return;
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
  registerPartMesh( part, mesh, options ){
    console.log("registering part mesh");
    var partId = undefined;
    //no partId was given, it means we have a mesh with no part (yet !)
    if( !part ) {
      var part = new Part( options );
      //FIXME: instead of PART , it could be a custom class created on the fly
      //this.makeNamedPartKlass( part, options.name || "testKlass" );
      part.pname = options.name || undefined;
      part.puid  = generateUUID(); //FIXME implement
      partId     = part.puid; //FIXME implement
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
      this.addTemplateMeshForPart( mesh.clone(), partId );
    }
    
    //FIXME: unsure, this is both too three.js specific, and a bit weird to inject data like that
    mesh.userData.part = part;
    return part;
  }
  
  /* register a part's (parametric) source
  */
  registerPartSource( part, source, options ){
  
  
  }
  
  registerPart( part ){
    if( !part ) throw new Error("no part specified, cannot register part");
    this.parts.push( part );
  }
  
  /*
  registerPartKlass( partKlass ){
  
  }*/
  
  /*experimental:
   generate a named subclass of part, based on the name of Part CLASS
   */
  makeNamedPartKlass( part, name){
    console.log("making named class");
    let subKlass = {
        constructor( options ){
          super.constructor( options );
        }
    };
    
    //FIXME : horrible
    var expSubClassStr = `class ${name} extends Part{
        constructor( options ){
          super( options );
        }
    }`;
    console.log("part pre change", part);
    part.__proto__ = testKlass;
    console.log("part post change", part);
  }
}

export { PartRegistry };
