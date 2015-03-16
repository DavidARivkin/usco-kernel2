import { Part } from "./Part";
import { PartRegistry } from "./PartRegistry";

import { Bom } from "./bom/Bom";

import { Assembly } from "./Assembly";

import { Design } from "./Design";

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
    this.activeDesign = new Design();
    
  }
  
  
  addPartInstance( partInst ){
    this.assemblies.add( partInst );
  }  

  registerPart( part=undefined, options={}, source=undefined, bin=undefined ){
    this.activeAssembly.add( part );
    console.log("assembly", this.activeAssembly );
    //JSON.stringify( this.activeAssembly )
    return part;
  }
  
  registerPart2( part=undefined, source=undefined, bin=undefined ,options={}){
  
  }
  
  duplicatePart( part ){
    var dupe = part.clone();
    this.activeAssembly.add( part );
    //TODO: how to deal with auto offset to preven overlaps
    return dupe
  }
  
}

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;
