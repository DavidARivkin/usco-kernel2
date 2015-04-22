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


//TODO:remove
//import { ThicknessAnnotation } from "./annotations/ThicknessAnnot.js"


class Kernel{
  constructor(stateIn={}){
    //stateIn is just a hack for now
    this.stateIn = stateIn;

    //FIXME: horrible temp hack
    //this.ThicknessAnnotation = ThicknessAnnotation;
  
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
    
    
    //TODO:remove, this is temporary
    this.activeAnnotations = [];


    //not sure
    this.assetManager = undefined;
  }

  
  registerPartType( part=undefined, source=undefined, mesh=undefined, options={} ){
    var partKlass = this.partRegistry.registerPartTypeMesh( part, mesh, options );
    
    //if we have meshes or sources
    if( "resource" in options ){
      let resource = options.resource;
      console.log("resource", resource);
      
      //saving mapping of meshNameToTypeUid
      this.dataApi.saveMeshNameToPartTypeUId(this.partRegistry._meshNameToPartTypeUId);

      //we have a mesh with a resource, store the file
      this.dataApi.saveFile( resource.name, resource._file );
    }
    //save part types??
    this.dataApi.saveCustomEntityTypes( this.partRegistry._customPartTypesMeta );
    
    this.bom.registerPartType( partKlass );
    
    return partKlass;
  }

  /*TODO: old , cleanup
    //TODO: clean this up, just a hack
      this.dataApi.designName = this.activeDesign.name;

  */
  
  /*
    get new instance of mesh for an entity that does not have a mesh YET
    
    TODO: change into getEntityMeshInstance
  */
  *getPartMeshInstance( entity ){
    let mesh = yield this.partRegistry.getPartTypeMesh( entity.typeUid );
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
    this.saveActiveAssemblyState();
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
    console.log("duplicating entity");
    //var dupe = entity.clone();
    //entity.prototype();
    let entityType = this.partRegistry.partTypes[ originalEntity.typeUid ];
    let dupe       = this.partRegistry.createTypeInstance( entityType );
    //FIXME: do this correctly
    let doNotCopy = ["iuid","name"];
    let onlyCopy = ["pos","rot","sca"];
    for(key in originalEntity ){
      console.log("key",key);
      if( onlyCopy.indexOf( key ) > -1 ){
        dupe[key] = Object.assign({}, originalEntity[key] );
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
    this.saveActiveAssemblyState();
    
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
  /*retrieve all active entities*/


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
    //this.saveActiveAssemblyState();
  }
  
  
  ////
  //main ser/unserialization api 
  loadDesign( uri, options ){
    let deferred = Q.defer();
    let self     = this;
    let $designData = this.dataApi.loadFullDesign(uri,options);

    function getMeshesToLoad(data){
      return data._neededMeshUrls;
    }
    function loadMeshes(uriOrData){
      let meshLoadParams= {
        parentUri:uri[0],
        keepRawData:true, 
        parsing:{useWorker:true,useBuffers:true} 
      }
      //FIXME: big hACK!!
      uriOrData = "./"+uriOrData
      let resource = self.assetManager.load( uriOrData, meshLoadParams );
      var $mesh = fromPromise(resource.deferred.promise);
    }

    $designData
      .take(1)
      .map(getMeshesToLoad)
      .flatMap(Rx.Observable.from)
      .map(loadMeshes)
      .subscribe(
      function (x) { console.log('onNext:', x); },
      function (e) { console.log('onError: %s', e); },
      function () { console.log('onCompleted'); }
    );



    return deferred.promise;
  }


  //FIXME after this point, very doubtfull to be kept in this form & shape
  saveDesign( design ){
    let design = this.activeDesign;
    console.log("saving design", design);
    let strForm = JSON.stringify( design );
    localStorage.setItem("jam!-data-design", strForm );
  }
  
  //returns a fake/ testing design
  //TODO: impletement, use at least promises, or better generators/ yield
  _loadDesign( uri, options, callback ){
    console.log("loading design from", uri);
    //FIXME: horrible
    let designName = uri.split("/").pop();
    console.log("designName", designName);
    let design = new Design({name:designName,title:"Groovy design", description:"a classy design"});
    //FIXME horrible
    this.activeDesign.name = designName;
    return this.activeDesign;
  }
  
  saveActiveAssemblyState( ){
    console.log("saving active assembly state");
    //localstorage
    let strForm = JSON.stringify( this.activeDesign.activeAssembly );
    localStorage.setItem("jam!-data-assembly", strForm );

    /*this.setState({
      design:{
        //name:this.state.design.name,
        activeAssembly: JSON.parse( strForm )
      }
    });*/

    //this.stateIn.activeAssembly = JSON.parse( strForm ); 
    console.log(this.stateIn)
  }
  
  loadActiveAssemblyState( callback ){
    //local storage
    let strAssembly = localStorage.getItem( "jam!-data-assembly" );
    this.activeDesign.activeAssembly = new Assembly( strAssembly );
  }
  
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
