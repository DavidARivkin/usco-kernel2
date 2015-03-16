import { Entity } from "./Entity";
import { generateUUID } from "./utils";

/*** 
*Base class for defining "parts"
***/
class Part extends Entity{
  constructor( options ){
    const DEFAULTS = {
      puid : undefined,//part id, common for all instances of a given part
      pname: undefined,//part CLASS name : common for all instances of a given part
      name: "",
      color : "#FFFFFFFF",
      pos: [0,0,0],
      rot: [0,0,0],
      sca: [1,1,1]
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    Object.assign( this, options );
  }
  
  
  clone(){
    console.log("foo");
    let clone = new Part({name:this.name,color:this.color,pos:this.pos,rot:this.rot,sca:this.sca});
    clone.puid = this.puid;
    
    return clone;
  }
  
  /*create a new , named Part sub class*/
  static consolidateToNewClass( name, klass ){
    if( !name )  throw new Error("No name provided to create new derived class");
    if( !klass ) throw new Error("No class provided to create new derived class");
    
    
  }
}
//"hurrah" for now class attributes
//assign id for the CLASS itself, common for all instances
//TODO: perhaps subclassing makes more sense ? ie create a new custom class
Part.id = generateUUID(); 



export { Part };
