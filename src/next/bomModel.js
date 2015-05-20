
//baseTypeuid => klass name
//typeUid => (klass name + params)
//one entry in bom => one typeUid

let addBomEntry$    = createAction()
let removeBomEntry$ = createAction()

let registerInstance$ = createAction()
let removeInstance$ = createAction()

let registerImplementation$ = createAction()
let unRegisterImplementation$ = createAction()

let selectBomEntry$ = createAction()
//let selectTypeUid???

///////

//getEntityInstanceIdsOfBomEntry

const bomEntryDefaults = {
  id: -1,
  name: "",
  description:"",
  version:"0.0.0",
  qty:0,
  physicalQty:0,//this can be used for weight, distance etc
  unit:"EA",//this applies to the physicalQty field

  parameters:"",
  implementations:{},//without defaults to "default":"xxx.stl"

  instanceInstUids:[]
}


///////
//OLD
    //bomEntry
    /*this.name        = name
    this.description = ""
    this.version     = "0.0.1"
    this.amount      = 0
    this.unit        = "EA"
    this.implementations = {}//"default":meshUri
    this.parameters      = ""*/
    //Object.assign(this, { x, y })


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
  /*
  registerImplementation( partName, meshUri  ){
    console.log("registering", meshUri, "as implementation of ", partName) 
    if(!partName) throw new Error("no part name specified")
    
    let bomEntry = this.getPartByName( partName )
    
    if(!bomEntry){
      partIndex += 1 
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
       }
      this.bom.push( bomEntry )
    }
    
    console.log("BOM",this.bom)
    return partIndex
  }*/