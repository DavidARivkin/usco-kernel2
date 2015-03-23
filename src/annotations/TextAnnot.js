import { Annotation } from "./Entity";

/*** 
*Simple "pin" (single point)  annotation
***/
class TextAnnotation extends Annotation{
  constructor( options ){
    const DEFAULTS = {
      diameter : undefined,
      position:{
        point: undefined,
        entity:undefined
      }
      orientation:undefined
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    Object.assign( this, options );
    
  }
  
  clone(){
    let clone = new TextAnnotation( { 
      name:this.name, title: this.title, notes:this.notes, color:this.color, 
      position:this.center, orientation:this.orientation } );
    return clone;
  }
}

TextAnnotation.prototype.typeUid = generateUUID();

export { TextAnnotation };
