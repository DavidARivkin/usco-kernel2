import { Part } from "./Part";
import { PartRegistry } from "./PartRegistry";
import { Bom } from "./bom/Bom";
import { Assembly } from "./Assembly";
import { Design } from "./Design";

//import * from "./utils" as utils;

/**
TODO: should be singleton
**/
class Kernel{
  constructor(){
    this.partRegistry = new PartRegistry();
    
    this.assemblies = [];
    this.activeAssembly = new Assembly();
    this.assemblies.push( this.activeAssembly );
    
    //not sure
    this.entitiesToMeshInstancesMap = new WeakMap();
    
    //not sure
    this.activeDesign = new Design();
    
    //not sure
    this.bom = new Bom();
    
  }
  
  //should be part class ? 
  registerPart( part=undefined, source=undefined, mesh=undefined, options={} ){
    var part = this.partRegistry.registerPartMesh( part, mesh, options );
    
    this.activeAssembly.add( part );
    console.log("assembly", this.activeAssembly );
    
    //register new instance in the Bill of materials
    //self._registerInstanceInBom( mesh.userData.part.bomId, mesh );
    //part.bomId = self._registerImplementationInFakeBOM( resource.uri, partName );
    
    return part;
  }
  
  registerPartInstance( partInst ){
    this.assemblies.add( partInst );
    
    //this.bom.registerInstance();
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
    
  } 
  
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
