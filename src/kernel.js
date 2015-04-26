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

import postProcessMesh from './utils/postProcessMesh'
import helpers         from 'glView-helpers'
let centerMesh         = helpers.mesthTools.centerMesh;


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
    //this.dataApi.saveCustomEntityTypes( this.partRegistry._customPartTypesMeta );
    
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
        parentUri:uri[0],
        keepRawData:true, 
        parsing:{useWorker:true,useBuffers:true} 
      }
      //FIXME: big hACK!!
      uriOrData = "./"+uriOrData
      let resource = self.assetManager.load( uriOrData, meshLoadParams );
      var $mesh = fromPromise(resource.deferred.promise);

      function extractMeshFromResource(resource) { 
        return resource.data
      }
      function registerMeshAsTypeTemplate(mesh){
        //add mesh as template for its type
        log.info("setting ",mesh,"as template of ",typeUid)
        self.partRegistry.addTemplateMeshForPartType( mesh.clone(), typeUid );
        return mesh;
      }
      let $registeredMesh = $mesh
        .map(extractMeshFromResource)
        .map(postProcessMesh)
        .map(centerMesh)
        .map(registerMeshAsTypeTemplate)
        .take(1);
      //.subscribe(logNext,logError,logDone)
      return $registeredMesh
    }

    return $designData.map(function(data)
    {

      let {design, bom, assemblies} = data;

      self.activeDesign = new Design(design);
      self.activeDesign.activeAssembly = new Assembly( assemblies[0] );

      self.activeAssembly = self.activeDesign.activeAssembly;

      //get the list of typeUids
      let neededTypeUids = new Set();
      self.activeDesign.activeAssembly.children.map(function(child){
        neededTypeUids.add( child.typeUid )
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

        //tmpOutputBom[index].id = typeUid;
        //index +=1;
      })

      /*
      //console.log("OUTPUTBOM",bom, tmpOutputBom)
      //console.log("OUTPUTASSEMBLY",tmpOutputAssembly)
      function extractTypeIdFromDescription(inputDescription){
        let key = bomEntry.description.split("part ").pop();
        let typeUid = parseInt(key);
        return typeUid;
      }

      function descriptionFormatter(inputDescription){
        let outputDescription = inputDescription.split("part ").shift();
        return outputDescription.trim();
      }

      //generate new outputs with new uids
      function generateNewTypeUidMapping( inputBom, inputAssembly, idGenerator=generateUUID){
        let outBom      = Object.assign([],inputBom);
        let outAssembly = Object.assign({},inputAssembly);

        outBom.map(function(bomEntry){
          let originalTypeId = bomEntry.id;
          let newTypeId      = idGenerator();
          bomEntry.id = newTypeId;
          bomEntry.description = descriptionFormatter(bomEntry.description);
          
          outAssembly.children.map(function(assemblyEntry){
            if(assemblyEntry.typeUid == originalTypeId){
              assemblyEntry.typeUid = newTypeId;
            }
          });

        })  

        let outAssemblies = [outAssembly];
        console.log("OUTPUTBOM",JSON.stringify(outBom) );
        console.log("OUTPUTASSEMBLY",JSON.stringify( outAssemblies) );
  
      }
      generateNewTypeUidMapping( tmpOutputBom, tmpOutputAssembly )*/


      //console.log("PLEASE LOAD",combos);
      //return Rx.Observable.fromArray(registrations)
      return registrations;
    })
    .flatMap(Rx.Observable.from)
    .mergeAll();
  }

  loadMesh(uriOrData, options){
     const DEFAULTS={
    }
    var options     = options || {};
    var display     = options.display === undefined ? true: options.display;
    var addToAssembly= options.addToAssembly === undefined ? true: options.addToAssembly;
    var keepRawData = options.keepRawData === undefined ? true: options.keepRawData;
    
    if(!uriOrData) throw new Error("no uri or data to load!");

    let self = this;
    let resource = this.assetManager.load( uriOrData, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } );

    var source = fromPromise(resource.deferred.promise);

    let logNext  = function( next ){
      log.info( next )
    }
    let logError = function( err){
      log.error(err)
    }

    let handleLoadError = function( err ){
       log.error("failed to load resource", err, resource.error);
       //do not keep error message on screen for too long, remove it after a while
       setTimeout(cleanupResource, self.dismissalTimeOnError);
       return resource;
    }
    let cleanupResource = function( resource ){
      log.info("cleaning up resources")
      self.assetManager.dismissResource( resource );
    }

    let register = function( shape ){
      //part type registration etc
      //we are registering a yet-uknown Part's type, getting back an instance of that type
      let partKlass    = self.kernel.registerPartType( null, null, shape, {name:resource.name, resource:resource} );
      let partInstance = undefined;
      if( addToAssembly ) {
        partInstance = self.kernel.makePartTypeInstance( partKlass );
        self.kernel.registerPartInstance( partInstance );
      }

      //FIXME: remove, this is just for testing
      self.addEntityType( partKlass)
      self.addEntityInstance(partInstance)
      //we do not return the shape since that becomes the "reference shape", not the
      //one that will be shown
      return {klass:partKlass,instance:partInstance};
    }

    let showIt = function( klassAndInstance ){
      if( display || addToAssembly ){
        //klassAndInstance.instance._selected = true;//SETTIN STATE !! not good like this
        self._tempForceDataUpdate();
      }

      return klassAndInstance
    }

    let mainProc = source
      .map( postProcessMesh )
      .map( centerMesh )
      .share();

    mainProc
      .map( register )
      .map( showIt )
      .map( function(klassAndInstance){
        //klassAndInstance.instance.pos[2]+=30;
        return klassAndInstance;
      })
        .catch(handleLoadError)
        //.timeout(100,cleanupResource)
        .subscribe(logNext,logError);

    mainProc.subscribe(logNext,logError);
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
  
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
