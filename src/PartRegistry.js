import { generateUUID } from "./utils";
import { Part } from "./Part";

//FIXME: how much of an overlap with bom ?
//FIXME: how much of an overlap with asset manager?
class PartRegistry{

  constructor(){
     //container for all already loaded meshes
    //TODO : should this be a facade ?
    this.parts = {};
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partMeshTemplates = {}; //the original base mesh: ONE PER PART
    this._partMeshWaiters  = {};//internal : when
    this.partMeshInstances = {};
    
    //FIXME: temporary , until I find better
    this._meshNameToPartId = {};
    
    this.partTypes = {};
  }
  
  /* 
    adds the "template mesh" for a given part
    this will be used as a basic instance to clone for all instances
    
    FIXME: is this no close to defining a class , of which all instances are...instances?
  */
  addTemplateMeshForPart( mesh, typeUid ){
    this._partMeshTemplates[ typeUid ] = mesh;
    
    //anybody waiting for that mesh yet ?
    if( this._partMeshWaiters[ typeUid ] ){
      console.log("resolving mesh of ", typeUid );
      this._partMeshWaiters[ typeUid ].resolve( mesh );
    }
  }
  
  
  /* wrapper abstracting whether one needs to wait for the part's mesh or not
  */
  *getEntityMesh( typeUid ){
    if( ! this._partMeshTemplates[ typeUid ] ) return;
    if( ! this._partMeshWaiters[ typeUid ] ) {
      this._partMeshWaiters[ typeUid ] = Q.defer();
    }
    
    //partMeshesToWaitFor.push( self.partWaiters[ typeUid ].promise );
    var mesh = yield this._partMeshWaiters[ typeUid ];
    return mesh
  }
  
  /* register a instance's 3d mesh
  this needs to be done PER INSTANCE not just once per part
  */
  registerPartMesh( part, mesh, options ){
    console.log("registering part mesh");
    
    //the options are actually for the MESH 
    //we get the name of the mesh (needed)
    let meshName = options.name || "";
    let cName = meshName.substr(0, meshName.lastIndexOf('.')); 
    cName = cName.replace("_","");
    //we do not want the mesh instance to have the name of the mesh file
    options.name = cName;
    
    let typeUid = this._meshNameToPartId[ meshName ];
    
    //no typeUid was given, it means we have a mesh with no part (yet !)
    if( !typeUid ) {
      
      //FIXME: instead of PART , it could be a custom class created on the fly
      let klass = Part;
      
      //create ...
      let dynKlass = this.makeNamedPartKlass( cName );
      //& register class
      this.partTypes[ typeUid ] = dynKlass;
      
      var part = new klass( options );//new Part( options );
      
      part.typeName = cName;//name of the part CLASS
      part.typeUid  = generateUUID(); //FIXME implement
      typeUid        = part.typeUid; //FIXME implement
      this._meshNameToPartId[ meshName ] = typeUid;
      this.parts[ typeUid ] = part;
      
    }else{
      part = this.parts[ typeUid ].clone();
      //totally absurd are we dealing with classes, instances or what???
    } 
    
    
    if( !this.partMeshInstances[ typeUid ] )
    {
      this.partMeshInstances[ typeUid ] = [];
    }
    this.partMeshInstances[ typeUid ].push( mesh );
    
    //do we have ANY meshes for this part
    //if not, add it to templates
    if( ! this._partMeshTemplates[ typeUid ] ){
      this.addTemplateMeshForPart( mesh.clone(), typeUid );
    }

    return part;
  }
  
  /* register a part's (parametric) source
  */
  registerPartSource( part, source, options ){
  }
  
  /*FIXME: not sure this is needed */
  registerPart( part ){
    if( !part ) throw new Error("no part specified, cannot register part");
    this.parts.push( part );
  }
  
  
  registerPartType( partKlass=undefined, typeName ){
  
  }
  
  /*experimental:
   generate a named subclass of part, based on the name of Part CLASS
  */
  makeNamedPartKlass( klassName ){
    console.log("making named class");
    
    //FIXME : won't work, as class is not support in browsers , where the eval() is taking
    //place
    /*let expSubClassStr = `class ${klassName} extends Part{
        constructor( options ){
          super( options );
        }
    }`;*/
    //SO we use the "old" es5 syntax
    
    let expSubClassStr = `var ${klassName} = function(options){
        Part.call( this, options );
      }
      ${klassName}.prototype = Object.create( Part.prototype );
      ${klassName}.prototype.constructor = ${klassName};  
    `;
    console.log("expSubClassStr",expSubClassStr);
    let klass = eval( expSubClassStr );
    /*console.log("part pre change", part);
    part.__proto__ = testKlass;
    console.log("part post change", part);*/
    console.log("klass",klass);
    return klass;
  }
}

export { PartRegistry };
