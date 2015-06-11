import Q from 'q'
import { generateUUID, hashCode, nameCleanup } from "./utils"
import Part from "./Part"

import {computeBoundingBox,computeBoundingSphere} from 'glView-helpers/src/meshTools/computeBounds'

import logger from 'log-minim'

let log = logger("PartRegistry")
log.setLevel("debug")


//experiment with generators
function meshResolver(){
  //let mesh = undefined 
  let inner = function* (mesh){
    if(mesh) yield mesh
  }
  function resolve(mesh)
  {
    //mesh = mesh
    inner.next(mesh)
  }
  /*return function* meshGen(mesh){
    yield mesh
  }*/
  return {
    resolve:resolve,
    promise:inner
  }
}

//FIXME: how much of an overlap with bom ?
//FIXME: how much of an overlap with asset manager?
class PartRegistry{

  constructor(){
     //container for all already loaded meshes
    //TODO : should this be a facade ?
    this.parts = {}
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partTypeMeshTemplates = {}//the original base mesh: ONE PER PART
    this._partTypeMeshWaiters  = {}//internal : when
    this.partMeshInstances = {}
    
    //FIXME: VISUALS temporary , until I find better
    this._meshNameToPartTypeUId = {}
    
    this.partTypes = {}
    this.partTypesByName = {}
    this.partTypeInstances = {}
    
    //FIXME: not sure: json representation of custom PART types, stored by typeUid
    this._customPartTypesMeta = {}
  }

  //resets all
  clear(){
    this.parts = {}
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partTypeMeshTemplates = {}//the original base mesh: ONE PER PART
    this._partTypeMeshWaiters  = {}//internal : when
    this.partMeshInstances = {}
    
    //FIXME: VISUALS temporary , until I find better
    this._meshNameToPartTypeUId = {}
    
    this.partTypes = {}
    this.partTypesByName = {}
    this.partTypeInstances = {}
    
    //FIXME: not sure: json representation of custom PART types, stored by typeUid
    this._customPartTypesMeta = {}
  }
  
  /* 
    adds the "template mesh" for a given part
    this will be used as a basic MESH instance to clone for all instances
  */
  addTemplateMeshForPartType( mesh, typeUid ){
    log.info("adding template mesh for part type")

    if( ! this._partTypeMeshTemplates[ typeUid ] ){
      
      this._partTypeMeshTemplates[ typeUid ] = mesh

      //console.log("computing bounds of mesh")
      computeBoundingSphere(mesh)
      computeBoundingBox(mesh)
      
      //anybody waiting for that mesh yet ?
      if( this._partTypeMeshWaiters[ typeUid ] ){
        this._partTypeMeshWaiters[ typeUid ].resolve( mesh )
      }
    }
  }
  
  /* 
  register a types's 3d mesh, 
  
    @returns: a class
  */
  registerPartTypeMesh( partKlass, mesh, options ){
    console.log("registering part mesh")
    
    /*we also check if the implementation (the stl, amf etc) file is already registered 
    as an implementation of some part type*/
    
    //the options are actually for the MESH 
    //we get the name of the mesh (needed)
    //we do not want the mesh instance to have the name of the mesh file
    let meshName = options.name || ""
    let cName = nameCleanup( meshName ) 
    
    let typeUid = this._meshNameToPartTypeUId[ meshName ]
    
    //no typeUid was given, it means we have a mesh with no part (yet !)
    if( !typeUid ) {
      //FIXME: instead of PART , it could be a custom class created on the fly
      let klass = Part
      typeUid = generateUUID()
      //create ...
      partKlass = this.makeNamedPartKlass( cName, typeUid )
      //& register class
      this.registerPartType( partKlass, cName, typeUid )
      //this.partTypes[ typeUid ]     = partKlass
      //this.partTypesByName[ cName ] = partKlass
      
      //TODO: move this to a visual specific part of the code
      this._meshNameToPartTypeUId[ meshName ] = typeUid
    }else{
      partKlass = this.partTypes[ typeUid ]
    } 
    
    //do we have ANY meshes for this part ?
    //if not, add it to templates
    this.addTemplateMeshForPartType( mesh.clone(), typeUid )

    return {partKlass,typeUid}
  }
  
  /* register a part type
  */
  registerPartType( partKlass, typeName, typeUid ){
      if( !partKlass ) throw new Error("no part type specified, cannot register part type")
      this.partTypes[ typeUid ]     = partKlass
      this.partTypesByName[ typeName ] = partKlass
  }
  
  /* register a part type's (parametric) source
  */
  registerPartTypeSource( part, source, options ){
  }
  
  /* register a part instance */
  registerPartInstance( partInstance ){
    if( !partInstance ) throw new Error("no part specified, cannot register part")
    //this.parts.push( part )
    let typeUid = partInstance.typeUid
    if( !this.partTypeInstances[ typeUid ] )
    {
      this.partTypeInstances[ typeUid ] = []
    }
    this.partTypeInstances[ typeUid ].push( partInstance )
  }
  
  /*experimental:
   generate a named subclass of part, based on the name of Part CLASS
  */
  makeNamedPartKlass( klassName, typeUid ){
    console.log("making named class")
    //FIXME : won't work, as class is not support in browsers , where the eval() is taking
    //place
    /*let expSubClassStr = `class ${klassName} extends Part{
        constructor( options ){
          super( options )
        }
    }`*/
    //SO we use the "old" es5 syntax
    let expSubClassStr = `var ${klassName} = function(options){
        Part.call( this, options )
      }
      ${klassName}.prototype = Object.create( Part.prototype )
      ${klassName}.prototype.constructor = ${klassName}  
      
      //set class attributes
      /*${klassName}.prototype.typeName = '${klassName}'
      ${klassName}.prototype.typeUid = '${typeUid}'*/
    `
    
    let klass = eval( expSubClassStr )
    klass.prototype.typeName = klassName
    klass.prototype.typeUid = typeUid
    
    //what do we need this for ???
    this._customPartTypesMeta[ typeUid ] = { typeName:klassName, typeUid:typeUid }
    
    
    return klass
  }
  
  /* create a new instance of a type */
  createTypeInstance( klassOrKlassName, options ){
    //let klass = this.partTypesByName[ klassName ]
    let klass = klassOrKlassName
    let typeUid = klass.prototype.typeUid
    var part = new klass( options )
    
    //Register instance
    this.registerPartInstance( part )
    //not sure
    part.name = part.typeName + "" + (this.partTypeInstances[ typeUid ].length - 1)
    return part
  }
  

  //alternative , reactive implementation
  _getPartTypeMesh(typeUid, original=false){


    _partTypeMeshWaiters[ typeUid ]
      .map()
  }

    
  /* wrapper abstracting whether one needs to wait for the part's mesh or not
  */
  *getPartTypeMesh( typeUid, original=false ){
    if(!typeUid) throw new Error("no typeUid specified")

    if( ! this._partTypeMeshTemplates[ typeUid ] && ! this._partTypeMeshWaiters[ typeUid ] ){
      throw new Error(`No matching mesh found for type : ${typeUid}`)
    }
    
    if( ! this._partTypeMeshWaiters[ typeUid ] ) {
      this._partTypeMeshWaiters[ typeUid ] =  Q.defer() //meshResolver()
    }
    
    if( this._partTypeMeshTemplates[ typeUid ] ){
      let mesh = this._partTypeMeshTemplates[ typeUid ] 
      this._partTypeMeshWaiters[ typeUid ].resolve( mesh )
    }
    
    let mesh = yield this._partTypeMeshWaiters[ typeUid ].promise
    //we have not been asked for the original mesh, get a copy instance

    //console.log("here, mesh",mesh)

    if( !original ){
      log.info("getting a clone")

      let newMaterial = mesh.material.clone()
      let newMesh = mesh.clone()
      newMesh.boundingBox = mesh.boundingBox
      newMesh.boundingSphere = mesh.boundingSphere
      newMesh.material = newMaterial

      mesh = newMesh

    }
    return mesh
  }
}

export default PartRegistry 
