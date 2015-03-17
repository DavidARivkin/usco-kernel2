import { Entity } from "../Entity";
import { generateUUID } from "./utils";

/*** 
*Base class for defining annotations
***/
class Annotation extends Entity{
  constructor( options ){
    const DEFAULTS = {
      name: "",
      title:"",
      notes:"",
      color : "#FFFFFFFF",
      //varName:"",not for now but TODO: explore further: this could allow for some interesing stuff
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    Object.assign( this, options );
  }
  
  clone(){
    let clone = new Annotation({name:this.name, this.title, this.notes, color:this.color});
    return clone;
  }
}

export { Annotation };
