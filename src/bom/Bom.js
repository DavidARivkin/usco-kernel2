import { hashCodeFromString } from "../utils";

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
    
    //mappings between part types and their bom entries: ie one bom entry per class + params
    this.partTypeToBomEntryMap = new WeakMap();
    this.bomEntryToPartTypeMap = new WeakMap();
    
    //this.bomEntryToPartInstances = new WeakMap();
    this.partTypeAndParamsToBomEntryMap = new Map();
    this.partInstanceToBomEntryMap = new WeakMap();
  }
  
  //basic api
  registerPartType( partKlass, parameters={} ){
    console.log("registering part type in bom", partKlass);
    const DEFAULTS = {
      id: -1,
      name: partKlass.prototype.typeName,
      description:"",
      version:"0.0.0",
      qty:0,
      physicalQty:0,//this can be used for weight, distance etc
      unit:"EA",//this applies to the physicalQty field
      parameters:parameters,
      implementations:{},//without defaults to "default":"xxx.stl"
      //FIXME: hack field? shoud this be in another data structure ?
      _instances:{}//same keys as implementations, values are in memory entities
    };
    let bomEntry = Object.assign({}, DEFAULTS, bomEntry); 
    
    //A unique bom entry is a partType/uid + a given set of parameters
    let hash = hashCodeFromString( partKlass.prototype.typeUid+JSON.stringify( parameters ) );
    if( ! this.partTypeAndParamsToBomEntryMap.has( hash ) )
    {
      this.partTypeAndParamsToBomEntryMap.set( hash, bomEntry );
      this.bom.push( bomEntry );
      bomEntry.id = this.bom.length - 1 ; 
    }
    //this.bomEntryToPartTypeMap.set( bomEntry, partKlass );
    //this.partTypeToBomEntryMap.set( [partKlass, parameters], bomEntry );
  }
  
  /*
    register an instance 
  */
  registerInstance( instance, parameters={} )
  {
    if(!instance) throw new Error("No instance given");
    
    let hash = hashCodeFromString( instance.typeUid+JSON.stringify( parameters ) );
    let bomEntry = this.partTypeAndParamsToBomEntryMap.get( hash )
    
    if(!bomEntry) throw new Error("Bom entry not found");
    //console.log("registering", instance, "as instance of ", bomEntry.name ); 
    //bomEntry._instances.push( instance);
    this.partInstanceToBomEntryMap.set( instance, bomEntry );
    
    //FIXME can't we use the length of instances ? or should we allow for human settable variation
    bomEntry.qty += 1;
  }
  
  /*remove an instance 
  
  */
  unRegisterInstance( instance ){
    if(!instance) throw new Error("No instance given");
    var bomEntry = this.partInstanceToBomEntryMap.get( instance );
    if(!bomEntry) throw new Error("Bom entry not found");
    
    //var index = bomEntry._instances.indexOf( instance );
    //if( index == -1 ) return;
    //bomEntry._instances.splice( index, 1 );
    this.partInstanceToBomEntryMap.delete( instance );
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
    
    let bomEntry = this.getPartByName( partName );
    
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
  getEntryInstances( entry ){
    this.bom[ entry ];
    return 
  }
  
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
  
  /*get all instances matching xxx*/
  lookUpInstanceRefs( bomEntriesIdx, bomEntryInstancesIdx, bom ){
    var selectionCandidates = [];
    for(var i=0; i<bomEntriesIdx.length;i++)
    {
      var partIndex = bomEntriesIdx[i];
      var instIndex = -1;//TODO implement
      if( bomEntryInstancesIdx && bomEntryInstancesIdx[partIndex] && bomEntryInstancesIdx[partIndex].length > 0 )
      {
        instIndex = 1;
      }
      
      var instances = this.bomMgr.getEntryInstances( );
      if(! bom[ partIndex ] ) continue;
      if(  bom[ partIndex ]._instances.length == 0 ) continue;
      
      if( instIndex == -1 ) //-1 means: select all
      {
        selectionCandidates = selectionCandidates.concat( bom[ partIndex ]._instances );
      }
      else{
      
        for(var j=0; j< bomEntryInstancesIdx[ partIndex ].length;j++)
        {
          selectionCandidates.push( bomEntryInstancesIdx[ partIndex ][j] )
        }
        //var selectionCandidate = bom[ partIndex ]._instances[ instIndex ];
        //selectionCandidates.push( selectionCandidate )
      }
    }
    return selectionCandidates;
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

export default Bom ;
