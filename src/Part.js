import { Entity } from "./Entity";
import { generateUUID } from "./utils";

/*** 
*Base class for defining "parts"
***/
class Part extends Entity{
  constructor( options ){
    const DEFAULTS = {
      typeUid : undefined,//part id, common for all instances of a given part
      typeName: undefined,//part CLASS name : common for all instances of a given part
      name: "",
      color : "#FFFFFFFF",
      pos: [0,0,0],
      rot: [0,0,0],
      sca: [1,1,1]
    }
    //this.DEFAULTS = DEFAULTS;
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    
    Object.assign( this, options );
  }
  
  clone(){
    let clone = new Part({name:this.name,color:this.color,pos:this.pos,rot:this.rot,sca:this.sca});
    clone.typeUid  = this.typeUid;
    clone.typeName = this.typeName;
    
    return clone;
    
    /*let keys = Object.keys( this.DEFAULTS );
    let fieldMap = {};
    let self = this;
    keys.map( function( key ){
      fieldMap[ key ] = self[ key ];
    });
    
    let clone = Object.create( this.__proto__, fieldMap );//prototype or __proto__ ??
    clone.puid  = this.puid;
    clone.pname = this.pname;
    return clone;*/
  }
  
  /*create a new , named Part sub class*/
  static consolidateToNewClass( name, klass ){
    if( !name )  throw new Error("No name provided to create new derived class");
    if( !klass ) throw new Error("No class provided to create new derived class");
    
    
  }
}
//"hurrah" for no class attributes...
Part.prototype.test = "foobar";
//assign id for the CLASS itself, common for all instances
//TODO: perhaps subclassing makes more sense ? ie create a new custom class
Part.prototype.id = generateUUID(); 



export { Part };
