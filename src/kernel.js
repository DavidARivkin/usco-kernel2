import { Part } from "./Part";
import { PartRegistry } from "./PartRegistry";
import { Bom } from "./bom/Bom";
import { Assembly } from "./Assembly";
import { Design } from "./design/Design";

import { TestApi } from "./testApi/testApi"

import { generateUUID, hashCode, nameCleanup } from "./utils";

import { co } from "co";

class Kernel{
  constructor(){
    //FIXME: horrible temp hack
    this.co = co;
  
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
    //FIXME: unsure, this is both too three.js specific, and a bit weird to 
    //inject data like that, mostly as we have mappings from entity to mesh already
    //mesh.userData.entity = part;
    return this.partRegistry.createTypeInstance( partType );
  }
  
  registerPartInstance( partInst ){
    this.activeAssembly.add( partInst );
    //register new instance in the Bill of materials
    this.bom.registerInstance( partInst, {} );
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
    
    //FIXME: add REMOVAL FROM BOM
    /*try{
      this._unRegisterInstanceFromBom( selectedObject.userData.part.bomId , selectedObject );
    }catch(error){} //FIXME: only works for items in bom*/
    
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
    return this.entitiesToMeshInstancesMap.get( entity );
  }
  
  /* retrieve the entity of a given mesh */
  getEntityOfMesh( mesh ){
    return this.meshInstancesToEntitiesMap.get( mesh );
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
  loadDesign( uri, options, callback ){
    console.log("loading design from", uri);
    //FIXME: horrible
    let designName = uri.split("/").pop();
    console.log("designName", designName);
    let design = new Design({name:designName,title:"Groovy design", description:"a classy design"});
    //FIXME horrible
    this.activeDesign.name = designName;
    
    return;
    
    //TODO: should look more like this
    //let design = yield this.dataApi.loadDesign( uri , options ); 
    
    //this.loadActiveAssemblyState( );
    //now get back mapping of fileName to uid
    let meshNameToPartTypeUId = localStorage.getItem("jam!-meshNameToPartTypeUId" );
    if( meshNameToPartTypeUId) {
      meshNameToPartTypeUId = JSON.parse( meshNameToPartTypeUId );
      this.partRegistry._meshNameToPartTypeUId = meshNameToPartTypeUId;
      
      //FIXME: horrible hack, see code in part registry
      for( key in meshNameToPartTypeUId)
      {
        let klass = Part;
        let cName = nameCleanup(key);
        let options = { name:cName };
        let part = new klass( options );//new Part( options );
        let typeUid = meshNameToPartTypeUId[key];
        
        part.typeName = cName;//name of the part CLASS
        part.typeUid  = typeUid;
        this.partRegistry.parts[ typeUid ] = part;
        
        this.partRegistry.registerPartInstance( part );
        //not sure
        part.name = part.typeName + "" + (this.partRegistry.partTypeInstances[ typeUid ].length - 1);
        
        //do we have ANY meshes for this part ?
        //if not, add it to templates
      }
    }
    
    
    
    //now that we have the list of files that we need, load those
    this.loadDocsOfDesign( callback );
    
    return this.activeDesign;
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
  
  /* TODO: how about reusing the asset manager????
    also : only load data for files actually use in assembly
  */
  loadDocsOfDesign( callback ){
    let self = this;
    let apiUri = "http://localhost:3080/api/";
    let uri = `${apiUri}designs/${this.activeDesign.name}/documents`;
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("fetched ok");
        console.log(this.responseText);
        let data = JSON.parse( this.responseText );
        data = data.filter( function( entry ){
          let ext = entry.split(".").pop();
          return ( ext.toLowerCase() === "stl");
        });
        if( callback ) callback( data );
        
        self._designDocs = data;
        
      } else {
        console.error('An error occurred!');
      }
    };
    xhr.send();
  }
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
