import { Part } from "./Part";
import { PartRegistry } from "./PartRegistry";
import { Bom } from "./bom/Bom";
import { Assembly } from "./Assembly";
import { Design } from "./design/Design";

//import * from "./utils" as utils;

/**
TODO: should be singleton
**/
class Kernel{
  constructor(){
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
    
  }
  
  //should be part class ? 
  registerPart( part=undefined, source=undefined, mesh=undefined, options={} ){
    var part = this.partRegistry.registerPartMesh( part, mesh, options );
    
    this.activeAssembly.add( part );
    console.log("assembly", this.activeAssembly );
    
    //register new instance in the Bill of materials
    this.bom.registerPart( part );
    //self._registerInstanceInBom( mesh.userData.part.bomId, mesh );
    //part.bomId = self._registerImplementationInFakeBOM( resource.uri, partName );
    
    //FIXME: unsure, this is both too three.js specific, and a bit weird to 
    //inject data like that, mostly as we have mappings from entity to mesh already
    mesh.userData.entity = part;
    
    return part;
  }
  
  /*
    get new instance of mesh for an entity that does not have a mesh YET
  */
  getPartMeshInstance( entity ){
    let mesh = this.partRegistry._partMeshTemplates[ entity.typeUid ].clone();
    this.registerEntityMeshRel( entity, mesh );
    return mesh;
  }
  
  registerPartInstance( partInst ){
    //this.assemblies.add( partInst );
    //this.bom.registerInstance();
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
  
  duplicateEntity( entity ){
    var dupe = entity.clone();
    if( entity instanceof Part )
    {
      this.activeAssembly.add( dupe );
      //TODO: how to deal with auto offset to prevent overlaps
    }
    return dupe
  }
  
  /* removes an entity 
  WARNING: this is not the same as deleting one*/
  removeEntity( entity ){
    this.activeAssembly.remove( entity );
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
  loadDesign( uri ){
    let design = new Design({name:"GroovyDesign",title:"Groovy design", description:"a classy design"});
    return design;
  }
  
  saveActiveAssemblyState( ){
    let strForm = JSON.stringify( this.activeDesign.activeAssembly );
    localStorage.setItem("jam!-data-assembly", strForm );
  }
  
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
