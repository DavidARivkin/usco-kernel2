import { Annotation } from "./Annotation";
import { generateUUID } from "../utils";
/*** 
*Thickness annotation
***/
class ThicknessAnnotation extends Annotation{
  constructor( options ){
    const DEFAULTS = {
      thickness : undefined,
      entry:{
        point:undefined
      },
      exit:{
        point:undefined
      },
      entity:undefined
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    Object.assign( this, options );
    
    //FIXME: not sure, this might allow hooking up things more easilly
    this.entities = [];
    this.entities.push( this.entity );
  }
  
  clone(){
    let clone = new ThicknessAnnotation( { 
      name:this.name, title: this.title, notes:this.notes, color:this.color, 
      thickness:this.thickness, entry:this.entry, exit:this.exit, entity:this.entity } );
    return clone;
  }
}

ThicknessAnnotation.prototype.typeUid = generateUUID();

export { ThicknessAnnotation };
