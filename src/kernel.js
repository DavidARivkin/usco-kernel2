import Part from "./Part"
import PartRegistry from "./PartRegistry"
import Assembly from "./Assembly"
import Design from "./design/Design"

import TestApi from "./testApi/testApi"

import { generateUUID, hashCode, nameCleanup } from "./utils"

import co from "co"

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
  constructor(){
    
    this.partRegistry = new PartRegistry()
    
    //this should be PER assembly
    this.entitiesToMeshInstancesMap = new WeakMap()
    this.meshInstancesToEntitiesMap = new WeakMap()//reverse map
    
    //not sure
    this.dataApi = new TestApi()
    
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
    if(bom) return this.dataApi.saveBom(bom)
  }

  saveAnnotations( annotations ){
    log.info("saving annotations")
    if(annotations) return this.dataApi.saveAnnotations(annotations)
  }

  /*load a design from the given uri*/
  loadDesign( uri, options ){
    log.info("loading design")
    let self     = this

    //determine the "fs/store/api to use"
    let {storeName,undefined} = parseFileUri(uri, function YMFSMatcher(storeName,uri,fileName){
      if(storeName === "xhr" && uri.indexOf("jamapi.youmagine.com") > -1 ) return "YM"
      return storeName
    })

    console.log("storeName",storeName)

    if(storeName === "YM") {
      let store = this.dataApi.store
      this.dataApi = new (require("./testApi/testApiYM"))
      this.dataApi.store = store
    }
    let dataApi = this.dataApi

    let designData$ = dataApi.loadFullDesign(uri,options)

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

    function convertToArray(object, fieldName){
      if(!object[fieldName]){
        return []
      }
      if(object[fieldName] == "" ) {
        return Array.prototype.slice.call(object[fieldName]) 
      }
      return object[fieldName]
    }

    return designData$
      .map(function(data)
      {
        let {design, bom, assemblies, annotations} = data
        let parentUri = uri

        //make sure we get arrays back
        design.authors  = convertToArray(design,"authors")
        design.licenses = convertToArray(design,"licenses")
        design.tags     = convertToArray(design,"tags")

        //FIXME !! temporary workaround for mismatch in field names
        bom = bom
          .map(function(entry){
            entry.name = entry.title;
            return entry})
        //FIXME: same here ! 
        annotations = annotations
          .map(function(entry){
            entry.typeUid = entry.type_uid
            return entry
          })

        //we need this combo {uri, typeUid, mesh}
        //uris need to be sent
        //typeUids
        //these are all the types (uids) used in current design
        let neededTypeUids =getNeededTypeIds(assemblies)

        let stuff = bom.map(function(bomEntry){
          let typeUid = bomEntry.id

          if(neededTypeUids.has(typeUid)){
            let binUri = bomEntry.implementations.default
            //TODO : use method 
            //binUri=parentUri+"/documents/"+binUri
            return {uri:binUri, typeUid}
          }
          return undefined
        })


        let meshSources$ = Rx.Observable
          .from( stuff )
          .filter( x => x!==undefined )
          .shareReplay(1)

        meshSources$ = meshSources$
          .flatMap(function(data){
            return dataApi.__getFileRealPath(data.uri)
              .catch(Rx.Observable.just(undefined)) //not perfect ,but this way we handle errors
          })
          .zip(meshSources$, function(realUri, entry){
            if(realUri !== undefined){
              return {uri:realUri, typeUid:entry.typeUid}
            }
          })
          .filter( x => x!==undefined )

        return {design, bom, assemblies, annotations, meshSources$}
      })
  }


}

module.exports = Kernel

