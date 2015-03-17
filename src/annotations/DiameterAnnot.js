import { Annotation } from "./Entity";

//FIXME; and what about annotation.tolerance ??
/*** 
*Diameter  annotation
***/
class DiameterAnnotation extends Annotation{
  constructor( options ){
    const DEFAULTS = {
      diameter : undefined,
      center:{
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
    let clone = new DiameterAnnotation( { 
      name:this.name, title: this.title, notes:this.notes, color:this.color, 
      diameter:this.diameter, center:this.center, orientation:this.orientation } );
    return clone;
  }
}

export { DiameterAnnotation };
