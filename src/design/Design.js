//import * as nid from "nid"; FIXME does not work
var nid = require('nid')
import { generateUUID } from "../utils"
import Assembly from "../Assembly"

class Design{
  constructor( options ){
     const DEFAULTS = {
      uid : generateUUID(),
      sid : nid(),//short id, 6 character
      name: "NewDesign",
      description:"",
      version:"0,0.0",
      url:"",
      authors:[ ],//{"name":"otherGirl","url": "www.mysite.com","email":"gg@bar.baz"}
      tags:[],
      licenses:["MIT"],
      meta:{state:"design"}
    };
    this.DEFAULTS = DEFAULTS;
    options = Object.assign({}, DEFAULTS, options); 
    Object.assign( this, options );
    
    //setup internals
    this.resources = [];
    
    //assemblies
    this.assemblies = [];
    this.activeAssembly = new Assembly();
    this.assemblies.push( this.activeAssembly );
  }
  
  //configure the fields to serialize
  toJSON() {
    console.log("calling toJSON method");
    let extraFields = [];//["activeAssembly"];
    let keys = Object.keys( this.DEFAULTS );
    
    keys = keys.concat( extraFields );
    let fieldMap = {};
    let self = this;
    keys.map( function( key ){
      fieldMap[ key ] = self[ key ];
    });
    console.log("fieldMap", fieldMap);
    return fieldMap
  };
  
}

export default Design
