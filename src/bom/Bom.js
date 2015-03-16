

class BomEntry{
  constructor(name, description, version, amount, unit, parameters){
    /*this.name        = name;
    this.description = "";
    this.version     = "0.0.1";
    this.amount      = 0;
    this.unit        = "EA";
    this.implementations = {};//"default":meshUri
    this.parameters      = "";*/
    //Object.assign(this, { x, y });
  }
}

class Bom {
  constructor(){
    //TODO: ermmm bom within bom?
    this.bom = [];
  }
  
  //basic api
  registerPart( partData, implementations={}, instances ){
    const DEFAULTS = {
      name:"",
      description:"",
      version:"0.0.0",
      qty:0,
      physicalQty:0,//this can be used for weight, distance etc
      unit:"EA",//this applies to the physicalQty field
      parameters:"",
      implementations:{},//without defaults to "default":"xxx.stl"
      
      //FIXME: hack field? shoud this be in another data structure ?
      _instances:{}//same keys as implementations, values are in memory instances ie "meshes"
    };
    
    let partData = Object.assign({}, DEFAULTS, partData); 
  }
  

  /*
    register an instance 
  
  */
  registerInstance( partId, instance )
  {
    if(!instance) throw new Error("No instance given");
    var bomEntry = this.bom[ partId ];
    if(!bomEntry) throw new Error("Not existing partId specified");
    
    //console.log("registering", instance, "as instance of ", bomEntry.name ); 
    bomEntry._instances.push( instance);
    //FIXME can't we use the length of instances ? or should we allow for human settable variation
    bomEntry.qty += 1;
  }
  
  /*remove an instance 
  
  */
  unRegisterInstance( partId, instance ){
    if(!instance) throw new Error("No instance given");
    var bomEntry = this.bom[ partId ];
    if(!bomEntry) throw new Error("bad partId specified");
    
    var index = bomEntry._instances.indexOf( instance );
    if( index == -1 ) return;
    
    bomEntry._instances.splice( index, 1 );
    //FIXME can't we use the length of instances ? or should we allow for human settable variation
    bomEntry.qty -= 1;
  }
  
 
  /*
    Register an IMPLEMENTATIOn in the bom: 
    an implementation is a key-value pair : 
      *key : the SOURCE (a parametric file used
    to generate a mesh) 
      *value: the concrete 
      for example a mesh/ mesh file (stl , amf)
    
    why an implementation ? because an entity/part can be created in different
    software, different formats etc, it still remains the same entity
    
    for example :
      {"cad/case.scad":"cad/case-top-0.0.1.stl"}
  */
  registerImplementation( partName, meshUri  ){
    console.log("registering", meshUri, "as implementation of ", partName); 
    if(!partName) throw new Error("no part name specified");
    
    /*var partIndex = -1;
    var bomEntry = null;
    
    for(var i=0;i<this.bom.length;i++)
    {
      var entry = this.bom[i];
      partIndex = i;
      if(entry.name === partName)
      {
        bomEntry = entry;
        break;
      }
    }*/
    let bomEntry = this.getPartByName( partName );
    if(!bomEntry){
    
    }
    
    if(!bomEntry){
      partIndex += 1; 
      bomEntry = {
        id:partIndex , 
        name:partName,
        description:"",
        version:"0.0.1",
        qty: 0,
        unit:"EA",
        url:"",
        implementations:{"default":meshUri},
        parameters:"",
        _instances:[],
        _instances2:{}
       };
      this.bom.push( bomEntry );
    }
    console.log("BOM",this.bom);
    return partIndex;
  }
  
  
  //helpers and extras
  
  getPartByName( partName ){
    var res = this.bom.find( entry => entry.name === partName );
    if( matches.length > 0 ) return res[0]
    return undefined;
  }
  
  /*retrieve all part names*/
  getPartNames(){
    var partNames = this.bom.map(obj => obj.name); //return obj.name
    return partNames;
  }
  
  /*find out if a part (name) is already in the bom*/
  isPartNameInBom( partName ){
    var matches = this.getPartByName( partName );
    if( matches ) return true;  
    return false;
  }
  
  /* find out if an implementation name already exists in the bom*/
  isPartImplementationInBom( implementationName ){
    for(var i=0;i<this.bom.length;i++)
    {
      var entry = this.bom[i];
      var implemNames = Object.keys(entry.implementations).map(key => entry.implementations[key]); 
      
      if( implemNames.includes( implementationName ) ){
        return true;
      }
    }
    return false;
  }
  
  /*inject an empty entry */
  addEmtpyEntry( partName, description ){
      partIndex = this.bom.length-1;
      
      bomEntry = {
      id:partIndex , 
      name:partName,
      description:"",
      version:"0.0.1",
      qty: 0,
      unit:"EA",
      url:"",
      implementations:{"default":""},
      parameters:"",
      _instances2:{}
     };
     
    this.bom.push( bomEntry );
  }
  
  /*
    (re)assign an instance to a given entry
    //var partId = instance.userData.part.partId;
  */
  assignInstanceToEntry( instance, partId ){
    this._unRegisterInstance( partId, instance );
    this._registerInstance( partId, instance );
  }
  
}


//object mixin testing
/*
Object.assign(Bom.prototype, {
    testMethod(arg1) {
      console.log("testing one two");
    }
});*/

export { Bom };
