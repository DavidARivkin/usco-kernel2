import { generateUUID } from "./utils";

class Design{
  constructor( options ){
     const DEFAULTS = {
      uid : generateUUID(),
      name: "",
      title:"",
      description:"",
      version:"0,0.0",
      url:"",
      authors:[ ],//{"name":"otherGirl","url": "www.mysite.com","email":"gg@bar.baz"}
      tags:[],
      licences:[],
      meta:{state:"design"}
    };
    
    let options = Object.assign({}, DEFAULTS, options); 
    Object.assign( this, options );
  }
  
}

export { Design }
