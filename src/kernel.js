import Part from "./Part"
import PartRegistry from "./PartRegistry"
import Bom from "./bom/Bom"
import Assembly from "./Assembly"
import Design from "./design/Design"

import TestApi from "./testApi/testApi"

import { generateUUID, hashCode, nameCleanup } from "./utils"

import co from "co"
import Q from 'q'

import Rx from 'rx'
let Observable= Rx.Observable;
let fromPromise = Observable.fromPromise;

import logger from 'log-minim'

let log = logger("kernel");
log.setLevel("debug");

import {parseFileUri} from './utils/pathUtils'

//TODO:remove
//import { ThicknessAnnotation } from "./annotations/ThicknessAnnot.js"

import postProcessMesh from './utils/postProcessMesh'
import helpers         from 'glView-helpers'
let centerMesh         = helpers.mesthTools.centerMesh;


function registerMeshAsTypeTemplate(mesh){
  //add mesh as template for its type
  log.info("setting ",mesh,"as template of ",typeUid)
  this.partRegistry.addTemplateMeshForPartType( mesh.clone(), typeUid )
  return mesh
}

function loadMeshAndRegisterItAsTemplate(uriOrData, typeUid, self, parentUri, storeName){
      
  let meshLoadParams= {
    parentUri,
    keepRawData:true, 
    parsing:{useWorker:true,useBuffers:true} 
  }

  //FIXME: big hACK!!
  if(storeName === "YM"){
   
   return self.dataApi.__loadFileUrl(uriOrData)
    .map(function(uriOrData){
      let resource = self.assetManager.load( uriOrData, meshLoadParams )
      //return fromPromise(resource.deferred.promise)
      return resource.deferred.promise
    })
    .flatMap(fromPromise)
    .pluck('data')
    .map(postProcessMesh)
    .map(centerMesh)
    .map(registerMeshAsTypeTemplate.bind(self))
    .take(1)

  }else{
    uriOrData = "./"+uriOrData
    let resource = self.assetManager.load( uriOrData, meshLoadParams )
    var $mesh = fromPromise(resource.deferred.promise)

    return $mesh
    .pluck('data')
    .map(postProcessMesh)
    .map(centerMesh)
    .map(registerMeshAsTypeTemplate)
    .take(1)
  }
}

 function hackInjectPartType (typeUid, index, partRegistry, bom, bomEntry){
  //FIXME:hack
  let partKlass = {typeUid:typeUid}
  let typeName  = "foo"+index
  partKlass.prototype = {typeName:typeName,typeUid:typeUid}
  
  let klass = partRegistry.makeNamedPartKlass( typeName, typeUid )
  partRegistry.registerPartType( klass, typeName, typeUid )
  bom.registerPartType( klass )
  bom.registerImplementation2(typeUid,{},"default",bomEntry.implementations.default)
   //self.registerPartType(undefined, undefined, undefined, {name:bomEntry.title});
  //part=undefined, source=undefined, mesh=undefined
  //null, null, shape, {name:resource.name, resource:resource}
}


class Kernel{
  constructor(stateIn={}){
    //stateIn is just a hack for now
    this.stateIn = stateIn

  
    this.partRegistry = new PartRegistry()
    
    //not sure at ALL
    this.activeDesign = new Design()
    
    //essential
    this.activeAssembly = this.activeDesign.activeAssembly
    
    //this should be PER assembly
    this.entitiesToMeshInstancesMap = new WeakMap()
    this.meshInstancesToEntitiesMap = new WeakMap()//reverse map
    
    //not sure
    this.bom = new Bom();
    
    //not sure
    this.dataApi = new TestApi()
    
    //not sure
    this.assetManager = undefined
  }

  setDesignAsPersistent(flag,rootUri){
    //log.info("setting design as persitent")
    
    //for now ,always assume YM api

    //determine the "fs/store/api to use"
    /*let {storeName,undefined} = parseFileUri(uri, function YMFSMatcher(storeName,uri,fileName){
      if(storeName === "xhr" && uri.indexOf("jamapi.youmagine.com") > -1 ) return "YM"
      return storeName
    })*/
    //FIXME: horrible !!! 
    if(flag){
      let store = this.dataApi.store
      let _rootUri = this.dataApi.rootUri
      this.dataApi = new (require("./testApi/testApiYM"))
      this.dataApi.store = store
      this.dataApi.rootUri = _rootUri
      if(rootUri) this.dataApi.rootUri = rootUri
    }else{
      let store = this.dataApi.store
      let _rootUri = this.dataApi.rootUri
      this.dataApi = new (require("./testApi/testApi"))
      this.dataApi.store = store
      this.dataApi.rootUri = _rootUri
      if(rootUri) this.dataApi.rootUri = rootUri
    }
  }

  testStuff(){
    let apiPath = "https://jamapi.youmagine.com/api/v1/designs/k61g98eJ"

    let store = this.dataApi.store
    this.dataApi = new (require("./testApi/testApiYM"))
    this.dataApi.store = store
    this.dataApi.rootUri = apiPath
    let assembly = {
      "name": " bar",
      "pos": [],
      "rot": [],
      "sca": [],
      "children": [
       { "name": " child1",
         "pos": [0,0,0],
         "rot": [0,0,0],
         "sca": [0,0,0]}
      ],
    }
    this.dataApi.saveAssemblyState(assembly)
  }
  
  registerPartType( part=undefined, source=undefined, mesh=undefined, options={} ){
    let {partKlass,typeUid} = this.partRegistry.registerPartTypeMesh( part, mesh, options )

    this.bom.registerPartType( partKlass )

    //if we have meshes or sources
    if( "resource" in options ){
      let resource = options.resource
      //console.log("resource", resource, resource._file);
      
      //saving mapping of meshNameToTypeUid
      this.dataApi.saveMeshNameToPartTypeUId(this.partRegistry._meshNameToPartTypeUId)
      //we have a mesh with a resource, store the file
      this.dataApi.saveFile( resource.name, resource._file )
      //the bom stores the mapping of typeuid to mesh name/path
      this.bom.registerImplementation2(typeUid,{},"default",resource.name)
    }
    //save part types??
    //this.dataApi.saveCustomEntityTypes( this.partRegistry._customPartTypesMeta )
    
    return {partKlass,typeUid}
  }
  
  /*
    get new instance of mesh for an entity that does not have a mesh YET
    
    TODO: change into getEntityMeshInstance
  */
  *getPartMeshInstance( entity ){
    let mesh = this.getMeshOfEntity(entity) //do we already have this one ?
    if(!mesh){
      mesh = yield this.partRegistry.getPartTypeMesh( entity.typeUid )
      //TODO: perhaps do this differently: ie return a wrapper mesh with just a bounding
      //box and "fill in"/stream in the mesh later ?
      this.registerEntityMeshRel( entity, mesh )
    }
    return mesh
  }
  
  makePartTypeInstance( partType ){
    return this.partRegistry.createTypeInstance( partType );
  }
  
  registerPartInstance( partInst ){
    this.activeAssembly.add( partInst );
    //register new instance in the Bill of materials
    this.bom.registerInstance( partInst, {} );
    
    //persist changes
    //this.saveAssemblyState();
  }  
  
  /* register the mesh <-> entity  relationship
  ie : what is visual/mesh for a given mesh and vice versa:
  ie : what is the entity of a given mesh
  */
  registerEntityMeshRel( entity, mesh ){
     if( !entity ) throw new Error(" no entity specified for registration with mesh");
     if( !mesh )   throw new Error(" no mesh specified for registration with entity");
     this.entitiesToMeshInstancesMap.set( entity, mesh );
     this.meshInstancesToEntitiesMap.set( mesh, entity );
  }
  
  duplicateEntity( originalEntity ){
    log.info("duplicating entity", originalEntity)

    let entityType = this.partRegistry.partTypes[ originalEntity.typeUid ]
    let dupe       = this.partRegistry.createTypeInstance( entityType )

    //FIXME: do this correctly
    let doNotCopy = ["iuid","name"]
    let onlyCopy = ["pos","rot","sca","color"]

    for(let key in originalEntity ){
      if( onlyCopy.indexOf( key ) > -1 ){
        dupe[key] = JSON.parse(JSON.stringify(originalEntity[key])) //Object.assign([], originalEntity[key] )
      }
    }
    //FIXME : needs to work with all entity types
    //dupe.typeName + "" + ( this.partRegistry.partTypeInstances[ dupe.typeUid ].length - 1)
    dupe.name = originalEntity.name + "" + ( this.partRegistry.partTypeInstances[ dupe.typeUid ].length - 1)
    
    return dupe
  }
  
  /* removes an entity 
  WARNING: this is not the same as deleting one*/
  removeEntity( entity, cull=false ){
    this.activeAssembly.remove( entity );
    this.bom.unRegisterInstance( entity );
        
    //remove entry not sure about this
    //this actually needs to be done on the visual side of things, not in the pure data layer
    /*let mesh = this.getMeshOfEntity( entity );
    this.entitiesToMeshInstancesMap.delete( entity );
    this.meshInstancesToEntitiesMap.delete( mesh );*/
  } 
  
  /* set the visual representation of an entity (3d)
  
    @param templateParams: how the visual gets adapted to the entity
  */
  registerVisualTypeForEntityType( mesh, entity, templateParams )
  {
  
  }
  
  //helpers
  /* is the given entity part of the active assembly?*/
  isEntityinActiveAssembly( entity ){
    return this.activeAssembly.isNodePresent( entity );
  }
  
  /* retrieve the visual/mesh of a given entity */
  getMeshOfEntity( entity ){
    if( !entity || ! this.entitiesToMeshInstancesMap.has( entity ) ) return undefined;
    return this.entitiesToMeshInstancesMap.get( entity );
  }
  
  /* retrieve the entity of a given mesh */
  getEntityOfMesh( mesh ){
    return this.meshInstancesToEntitiesMap.get( mesh );
  }
  
  //////////////////////////
  
  /*resets everything to empty*/
  clearAll(){
    this.partRegistry.clear()
    this.bom.clear()
  }
  
  //////////////////////////////
  //////////////////////////////
  //main ser/unserialization api 

  saveDesignMeta( data ){
    log.debug("saving design metadata")
    if(data) return this.dataApi.saveDesignMeta( data )
  }

  saveAssemblyState( assembly ){
    log.info("saving assembly state")
    if(assembly) return this.dataApi.saveAssemblyState(assembly)
  }

  saveBom( bom ){
    log.info("saving bom state")
    let bom = this.bom.bom

    if(bom) return this.dataApi.saveBom(bom)
  }

  saveAnnotations( annotations ){
    log.info("saving annotations")
    if(annotations) return this.dataApi.saveAnnotations(annotations)
  }

  /*load a design from the given uri*/
  loadDesign( uri, options ){
    log.info("loading design")
    let deferred = Q.defer()
    let self     = this

    function logNext( next ){
      log.info( next )
    }
    function logError( err){
      log.error(err)
    }
    function logDone( data) {
      log.info("DONE",data)
    }

    //determine the "fs/store/api to use"
    let {storeName,undefined} = parseFileUri(uri, function YMFSMatcher(storeName,uri,fileName){
      if(storeName === "xhr" && uri.indexOf("jamapi.youmagine.com") > -1 ) return "YM"
      return storeName
    })
    if(storeName === "YM") {
      let store = this.dataApi.store
      this.dataApi = new (require("./testApi/testApiYM"))
      this.dataApi.store = store
    }

    let designData$ = this.dataApi.loadFullDesign(uri,options)

    designData$ = designData$
      .take(1)
      .share()

    function getNeededTypeIds(assemblyNode){
      let neededTypeUids = new Set()
      assemblyNode.children
        .map(function(child){
          neededTypeUids.add( child.typeUid )
        })
      log.info("needed types",neededTypeUids)
      return neededTypeUids
    }

    designData$ = designData$.map(function(data)
    {

      let {design, bom, assemblies} = data

      self.activeDesign = new Design(design)
      self.activeDesign.activeAssembly = new Assembly( assemblies )//[0] )
      console.log("loaded design ", design, self.activeDesign)

      self.activeDesign.uuid = design.uuid
      //apply a few potential fixes
      self.activeDesign.activeAssembly.children = self.activeDesign.activeAssembly.children || []

      //let assemblies = assemblies

      function convertToArray(object, fieldName){
        if(!object[fieldName]){
          return []
        }
        if(object[fieldName] == "" ) {
          return Array.prototype.slice.call(object[fieldName]) 
        }
        return object[fieldName]
      }
      self.activeDesign.authors = convertToArray(self.activeDesign,"authors")
      self.activeDesign.licenses = convertToArray(self.activeDesign,"licenses")
      self.activeDesign.tags     = convertToArray(self.activeDesign,"tags")
      
      self.activeAssembly = self.activeDesign.activeAssembly

      //get the list of typeUids
      let neededTypeUids =getNeededTypeIds(self.activeDesign.activeAssembly)
    
      //now fetch the uris of the corresponding bom entry implems
      let combos = {}
      let registrations = []

      let index = 0
      bom.map(function(bomEntry){
        let typeUid = bomEntry.id

        if(neededTypeUids.has(typeUid)){
          let binUri = bomEntry.implementations.default
          combos[typeUid] = binUri
          //DO THE LOADINNG!!
          registrations.push( loadMeshAndRegisterItAsTemplate( binUri, typeUid, self, uri, storeName ) )
        }

        //note, index is even more useless than the rest
        hackInjectPartType(typeUid, index, self.partRegistry, self.bom, bomEntry)
      })

      //FIXME: ugh, why do we need to re-iterate?
      self.activeDesign.activeAssembly.children.map(function(child){
        try{
        self.bom.registerInstance( child, {} )
        }catch(error){}
      })

      return registrations
    })
    .shareReplay(1)

    //deal with loading stuff
    designData$
      .flatMap(Rx.Observable.from)
      .mergeAll()

    return designData$
  }


}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
