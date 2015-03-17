import { Annotation } from "./Entity";

/*** 
*Distance  annotation
***/
class DistanceAnnotation extends Annotation{
  constructor( options ){
    const DEFAULTS = {
      distance : undefined,
      start:{
        point :undefined,
        entity:undefined
      },
      end:{
        point: undefined,
        entity:undefined
      }
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );
    Object.assign( this, options );
    
  }
  
  clone(){
    let clone = new DistanceAnnotation( { 
      name:this.name, title: this.title, notes:this.notes, color:this.color, 
      distance:this.distance, start:this.start, end:this.end } );
    return clone;
  }
}

export { DistanceAnnotation };
