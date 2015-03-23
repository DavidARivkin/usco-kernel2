import { Part } from "./Part";
import { PartRegistry } from "./PartRegistry";
import { Bom } from "./bom/Bom";
import { Assembly } from "./Assembly";
import { Design } from "./design/Design";

import { TestApi } from "./testApi/testApi"

import { generateUUID, hashCode, nameCleanup } from "./utils";


import { co } from "co";

//TODO:remove
import { ThicknessAnnotation } from "./annotations/ThicknessAnnot.js"


class Kernel{
  constructor(){
    //FIXME: horrible temp hack
    this.co = co;
    this.ThicknessAnnotation = ThicknessAnnotation;
  
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
  }

  
  registerPartType( part=undefined, source=undefined, mesh=undefined, options={} ){
    var partKlass = this.partRegistry.registerPartTypeMesh( part, mesh, options );
    
    //if we have meshes or sources
    if( "resource" in options ){
      let resource = options.resource;
      console.log("resource", resource);
      
      //TODO: clean this up, just a hack
      this.dataApi.designName = this.activeDesign.name;
      //console.log("docs of design updated", this.partRegistry._meshNameToPartTypeUId[ fileName ] );
      //TODO: store this resourceName/URI ==> uid on the server somewhere
      let meshNameToPartTypeUIdMapStr = JSON.stringify( this.partRegistry._meshNameToPartTypeUId );
      localStorage.setItem("jam!-meshNameToPartTypeUId", meshNameToPartTypeUIdMapStr );
      //we have a mesh with a resource, store the file
      this.dataApi.saveFile( resource.name, resource._file );
    }
    //save part types??
    this.dataApi.saveCustomEntityTypes( this.partRegistry._customPartTypesMeta );
    
    this.bom.registerPartType( partKlass );
    
    return partKlass;
  }
  
  /*
    get new instance of mesh for an entity that does not have a mesh YET
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
  removeEntity( entity ){
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
  
  //helpers

  /* is the given entity part of the active assembly?*/
  isEntityinActiveAssembly( entity ){
    //this.entitiesToMeshInstancesMap.has( entity );
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
  //FIXME after this point, very doubtfull to be kept in this form & shape
  saveDesign( design ){
    let design = this.activeDesign;
    console.log("saving design", design);
    let strForm = JSON.stringify( design );
    localStorage.setItem("jam!-data-design", strForm );
  }
  
  //returns a fake/ testing design
  //TODO: impletement, use at least promises, or better generators/ yield
  loadDesign( uri, options, callback ){
    console.log("loading design from", uri);
    //FIXME: horrible
    let designName = uri.split("/").pop();
    console.log("designName", designName);
    let design = new Design({name:designName,title:"Groovy design", description:"a classy design"});
    //FIXME horrible
    this.activeDesign.name = designName;
    return;
  }
  
  saveActiveAssemblyState( ){
    console.log("saving active assembly state");
    //localstorage
    let strForm = JSON.stringify( this.activeDesign.activeAssembly );
    localStorage.setItem("jam!-data-assembly", strForm );
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
