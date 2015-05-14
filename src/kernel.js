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


class Kernel{
  constructor(stateIn={}){
    //stateIn is just a hack for now
    this.stateIn = stateIn;

  
    this.partRegistry = new PartRegistry();
    
    //not sure at ALL
    this.activeDesign = new Design();
    
    //essential
    this.activeAssembly = this.activeDesign.activeAssembly;
    
    //this should be PER assembly
    this.entitiesToMeshInstancesMap = new WeakMap();
    this.meshInstancesToEntitiesMap = new WeakMap();//reverse map
    
    //not sure
    this.bom = new Bom();
    
    //not sure
    this.dataApi = new TestApi();
    
    //not sure
    this.assetManager = undefined;
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
    let mesh = yield this.partRegistry.getPartTypeMesh( entity.typeUid )
    //log.error("entity",entity)
    //TODO: perhaps do this differently: ie return a wrapper mesh with just a bounding
    //box and "fill in"/stream in the mesh later ?
    this.registerEntityMeshRel( entity, mesh );
    return mesh;
  }
  
  makePartTypeInstance( partType ){
    return this.partRegistry.createTypeInstance( partType );
  }
  
  registerPartInstance( partInst ){
    this.activeAssembly.add( partInst );
    //register new instance in the Bill of materials
    this.bom.registerInstance( partInst, {} );
    
    //persist changes
    this.saveAssemblyState();
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
  
  duplicateEntity( originalEntity, addToAssembly=true ){
    log.info("duplicating entity", originalEntity);

    let entityType = this.partRegistry.partTypes[ originalEntity.typeUid ];
    let dupe       = this.partRegistry.createTypeInstance( entityType );
    //FIXME: do this correctly
    let doNotCopy = ["iuid","name"];
    let onlyCopy = ["pos","rot","sca"];
    for(let key in originalEntity ){
      console.log("key",key);
      if( onlyCopy.indexOf( key ) > -1 ){
        dupe[key] = Object.assign([], originalEntity[key] );//FIXME: object vs array
      }
    }
    
    //FIXME : needs to work with all entity types
    dupe.name = dupe.typeName + "" + ( this.partRegistry.partTypeInstances[ dupe.typeUid ].length - 1);
    
    if( addToAssembly )//entity instanceof Part )
    {
      this.registerPartInstance( dupe );
      //TODO: how to deal with auto offset to prevent overlaps ?
    }
    return dupe
  }
  
  /* removes an entity 
  WARNING: this is not the same as deleting one*/
  removeEntity( entity, cull=false ){
    this.activeAssembly.remove( entity );
    this.bom.unRegisterInstance( entity );
    
    //persist changes
    this.saveAssemblyState();
    
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
  //FIXME: remove this, annotation specific
  addAnnotation( annotation ){
    this.annotations.push( annotation );
    
    //this.activeAssembly.push( annotation );
    //this changes the assembly so ..save it
    //this.saveAssemblyState();
  }
  
  /*resets everything to empty*/
  clearAll(){
    this.partRegistry.clear()
    this.bom.clear()
  }
  
  //////////////////////////////
  //////////////////////////////
  //main ser/unserialization api 

  saveDesignMeta( data ){
    log.debug("ATTEMPTING TO SAVE DESIGN META")
    return this.dataApi.saveDesignMeta( data )
  }

  saveAssemblyState( assembly ){
    log.info("saving assembly state")
    return this.dataApi.saveAssemblyState(assembly)
  }

  saveBom( bom ){
    log.info("saving bom state")
    let bom = this.bom.bom

    return this.dataApi.saveBom(bom)
  }

  /*load a design from the given uri*/
  loadDesign( uri, options ){
    let deferred = Q.defer();
    let self     = this;

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



    let $designData = this.dataApi.loadFullDesign(uri,options);

    $designData =  $designData.take(1).share();

    function logNext( next ){
      log.info( next )
    }
    function logError( err){
      log.error(err)
    }
    function logDone( data) {
      log.info("DONE",data)
    }
    
    function loadMeshAndRegisterItAsTemplate(uriOrData, typeUid){
      
      let meshLoadParams= {
        parentUri:uri,
        keepRawData:true, 
        parsing:{useWorker:true,useBuffers:true} 
      }

     
      function registerMeshAsTypeTemplate(mesh){
        //add mesh as template for its type
        log.info("setting ",mesh,"as template of ",typeUid)
        self.partRegistry.addTemplateMeshForPartType( mesh.clone(), typeUid )
        return mesh
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
        .map(registerMeshAsTypeTemplate)
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

    return $designData.map(function(data)
    {

      let {design, bom, assemblies} = data;

      self.activeDesign = new Design(design);
      self.activeDesign.activeAssembly = new Assembly( assemblies[0] );

      self.activeDesign.activeAssembly.children = self.activeDesign.activeAssembly.children || []
      self.activeAssembly = self.activeDesign.activeAssembly;

      //get the list of typeUids
      let neededTypeUids = new Set();
      self.activeDesign.activeAssembly.children.map(function(child){
        neededTypeUids.add( child.typeUid );
      })

      log.info(neededTypeUids)

      //now fetch the uris of the corresponding bom entry implems
      let uris = [];
      let combos = {};
      let registrations = [];

      //let tmpOutputBom = Object.assign([],bom);
      //let tmpOutputAssembly = Object.assign({},assemblies[0])

      let index = 0;
      bom.map(function(bomEntry){
        //let key = bomEntry.description.split("part ").pop();
        //let typeUid = parseInt(key)
        let typeUid = bomEntry.id;

        if(neededTypeUids.has(typeUid)){
          let binUri = bomEntry.implementations.default;
          //console.log("PLEASE LOAD",bomEntry.implementations.default);
          combos[typeUid] = binUri;

          //DO THE LOADINNG!!
          registrations.push( loadMeshAndRegisterItAsTemplate( binUri, typeUid ) );
        }

        //FIXME:hack
        console.log("here", bomEntry)
        let partKlass = {typeUid:typeUid};
        let typeName  = "foo"+index;
        partKlass.prototype = {typeName:typeName,typeUid:typeUid}
        
        let klass = self.partRegistry.makeNamedPartKlass( typeName, typeUid );
        self.partRegistry.registerPartType( klass, typeName, typeUid );
        self.bom.registerPartType( klass );

        //self.registerPartType(undefined, undefined, undefined, {name:bomEntry.title});
        //part=undefined, source=undefined, mesh=undefined
        //null, null, shape, {name:resource.name, resource:resource}
      })

      //FIXME: ugh, why do we need to re-iterate?
      self.activeDesign.activeAssembly.children.map(function(child){
        try{
        self.bom.registerInstance( child, {} )
        }catch(error){}
      })

      return registrations
    })
    .map(function(regs){
      console.log("regs",regs)
      return regs
    })
    .flatMap(Rx.Observable.from)
    .mergeAll()
  }


}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
