import Rx from 'rx'
let Observable= Rx.Observable;
let fromPromise = Observable.fromPromise;

import logger from 'log-minim'

let log = logger("testApi");
log.setLevel("debug");

import {normalizeString} from '../utils'


function jsonToFormData(jsonData){
  let jsonData = JSON.parse( JSON.stringify( jsonData ) );
  let formData = new FormData();
  for(let fieldName in jsonData){
    let value = jsonData[fieldName];
    //value = encodeURIComponent(JSON.stringify(value))
    //value = JSON.stringify(value)
    //value = value.replace(/\"/g, '');
    formData.append(fieldName, value);
  }
  return formData;
}

class TestApi{
  constructor(){
    this.apiUri    = "http://localhost:3080/api/";
    this.designsUri = this.apiUri+"designs/";
    
    this.designsUri = "http://jamapi.youmagine.com/api/v1/designs/";
    //let designUri = "http://jamapi.youmagine.com/api/v1/designs/test";
    this.rootUri    = undefined;
    this.designName = undefined;

    this.assembliesFileName = "assemblies.json";//"assemblies_old.json";//"assemblies-simple.json"//
    this.bomFileName        = "bom.json";//"bom_old.json"//"bom.json";
    //TODO: use our pre-exising "stores"
    this._designDocs = [];

    //this.assetManager = undefined;
    this.store = undefined;
  }

  //FIXME: not sure about this ?
  setDesignName(name){
    this.rootUri = this.designsUri+"/"+name;
    //check if the name is taken ?
  }

  /*load all required elements of a design*/
  loadFullDesign(designUri){
    log.info("loading design from uri",designUri)
    //check if design root exists
    this.rootUri = designUri;

    //fetch design.json
    let $designMeta = this.loadDesignMeta();
    
    //fetch bom.json
    let $bom = this.loadBom()

    //fetch assemblies.json
    let $assembly = this.loadAssemblyState();
    
    //fetch mapping type->uid
    //this.loadMeshNameToPartTypeUId();

    //fetch needed meshes
    //let $meshes = this.loadMeshes();


    function generateOutputData(designMeta, bom, assemblies){
      //console.log(designMeta, bom, assemblies); 
      let output = {}
      output.design = designMeta;
      output.bom = bom;
      output.assemblies = assemblies[0].default
      return output
    }

    function getNeededMeshesData(data){
      //console.log(data)
      let {design, bom, assemblies} = data;
      //we only care about the first assembly
      let assembly = assemblies //[0];
      //for every item in the assembly, fetch the needed data

      let output = Object.assign({}, data);
      /*let meshUrls = [];
      bom.forEach(function(bomEntry){
        if(bomEntry && bomEntry.implementations && bomEntry.implementations.default){
          let meshFileUri = bomEntry.implementations.default;
          meshUrls.push( meshFileUri )
        }
      })
      output._neededMeshUrls = meshUrls;*/
      //let meshNameToTypeUidUri = {};
      //this.partRegistry._meshNameToPartTypeUId = meshNameToTypeUidUri;

      //now that we have the list of files that we need, load those
      return output;
    }

    var source = Rx.Observable.combineLatest(
        $designMeta,
        $bom,
        $assembly,
        generateOutputData
    )
      .take(1)
      .map(getNeededMeshesData);

    return source;
   
  }

  ///////////
  /* load a given assembly*/
  loadAssemblyState( ){
    let assemblyUri = `${this.rootUri}/${this.assembliesFileName}`;

    /*let defferred = store.read(fileOrFileName)
    return defferred.promise.then(function(){
      let strAssembly = JSON.parse( strAssembly );
      return strAssembly
    })*/

    //NOTE : this is a cancellable q deferred, not a promise
    let rawAssemblyPromise = this.store.read(assemblyUri).promise;
    //self.activeDesign.activeAssembly = new Assembly( strAssembly );
    let $rawData = fromPromise(rawAssemblyPromise);
    return $rawData.map( data => JSON.parse( data) );
  }

  /*checks if a design exists*/
  doesDesignExist(path){
    this.designsUri
  }

  /*load the deign metadata*/
  loadDesignMeta(){
    let designUri = `${this.rootUri}/design.json`;
    log.info("Loading design meta from ",designUri)

    //NOTE : this is a cancellable q deferred, not a promise
    let rawDesignMetaPromise = this.store.read(designUri).promise;
    let $rawDesignMeta = fromPromise(rawDesignMetaPromise);
    return $rawDesignMeta.map( data => JSON.parse( data) );
  }

  /*save the design metadata*/
  saveDesignMeta(designMeta){
    if(!this.rootUri && ! this.designsUri){
      log.info("not rootUri specified, cannot save designMeta")
      return
    }

    let designUri = this.designsUri+normalizeString(designMeta.name)
    if(!this.rootUri){
      this.rootUri = designUri
    }

    //FIXME: temporary hack
    designMeta.title = designMeta.name
    //setDesignName
    log.info("Saving design meta to ", designUri, "data",designMeta)

    let deferred = this.store.write(designUri, designMeta, {formatter:jsonToFormData})
    return deferred
  }

  /*load the bill of materials*/
  loadBom(){
    let bomUri = `${this.rootUri}/${this.bomFileName}`;
    log.info("Loading bom from ",bomUri)

    //NOTE : this is a cancellable q deferred, not a promise
    let rawBomPromise = this.store.read(bomUri).promise;
    let rawBom$ = fromPromise(rawBomPromise);
    return rawBom$.map( data => JSON.parse( data) );
  }

  /*load meshName -> partUid mapping*/
  loadMeshNameToPartTypeUId(){
    let meshNameToTypeUidUri = `${this.rootUri}/bom.json`;

    //NOTE : this is a cancellable q deferred, not a promise
    let rawMappingPromise = this.store.read(bomUri).promise;
    let rawBom$ = fromPromise(rawBomPromise);
    return rawBom$.map( data => JSON.parse( data) );
  }

  /*load meshes*/
  loadMeshes(){
    let bomUri = `${this.rootUri}/bom.json`;
    log.info("Loading bom from ",bomUri)

    //NOTE : this is a cancellable q deferred, not a promise
    let rawBomPromise = this.store.read(bomUri).promise;
    let rawBom$ = fromPromise(rawBomPromise);
    return rawBom$.map( data => JSON.parse( data) );
  }

  /*save a file/document at the given path*/
  saveFile( path, data ){
    if(!this.rootUri){
      log.info("not rootUri specified, cannot save file")
      return;
    }
    log.info("saving file to",path)

    let fileName = path;
    let cleanedFileName = path.toLowerCase().replace(/\./g, '-')
    //let fileUri = "http://jamapi.youmagine.com/api/v1/designs/test/documents/"+cleanedFileName
    let fileUri = `${this.rootUri}/documents/${cleanedFileName}`
    log.debug("real save path", fileUri)

    let uploadData ={
      modelfile:data
    }

    uploadData = new FormData();
    uploadData.append("modelfile", data)

    let rawDef = this.store.write(fileUri, uploadData )//, {formatter:jsonToFormData})
    let rawPromise =rawDef.promise
    console.log(rawPromise)
    let foo$ = fromPromise(rawPromise)
      .subscribe(
        function(res){console.log("ok",res)},
        function(res){console.log("ok",res)},
        function(res){console.log("error",res)}
      ) 
  }


  ///////////////

  //FIMXE : redundance with main app
  loadMesh(uriOrData, options){
    let resource = this.assetManager.load( uriOrData, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } );
    var source = fromPromise(resource.deferred.promise);
  }

  /*save association between mesh Name and type uid*/
  saveMeshNameToPartTypeUId(meshNameToPartTypeUId){
    //TODO: store this resourceName/URI ==> uid on the server somewhere
    let meshNameToPartTypeUIdMapStr = JSON.stringify( meshNameToPartTypeUId );
    localStorage.setItem("jam!-meshNameToPartTypeUId", meshNameToPartTypeUIdMapStr );
  }

  /*fetch all of the designs of a given user*/
  getUserDesigns(user,options){

  }

  saveDesign( design, options ){
    console.log("saving design", design);
    //var co = require('co');
  }
  
  loadDesign( uri, options ){
    console.log("loading design from", uri);
    
     //TODO: should look more like this
    //let design = yield this.dataApi.loadDesign( uri , options ); 
    
    meshNameToPartTypeUId = JSON.parse( meshNameToPartTypeUId );
    if( meshNameToPartTypeUId) {
      meshNameToPartTypeUId = JSON.parse( meshNameToPartTypeUId );
      this.partRegistry._meshNameToPartTypeUId = meshNameToPartTypeUId;
      
      //FIXME: horrible hack, see code in part registry
      for( key in meshNameToPartTypeUId)
      {
        let klass = Part;
        let cName = nameCleanup(key);
        let options = { name:cName };
        let part = new klass( options );//new Part( options );
        let typeUid = meshNameToPartTypeUId[key];
        
        part.typeName = cName;//name of the part CLASS
        part.typeUid  = typeUid;
        this.partRegistry.parts[ typeUid ] = part;
        
        this.partRegistry.registerPartInstance( part );
        //not sure
        part.name = part.typeName + "" + (this.partRegistry.partTypeInstances[ typeUid ].length - 1);
        
        //do we have ANY meshes for this part ?
        //if not, add it to templates
      }
    }
    
    
    
    //now that we have the list of files that we need, load those
    this.loadDocsOfDesign( callback );
    
    return this.activeDesign;
    
  }
  
  saveAssemblyState( ){
    let strForm = JSON.stringify( {assembly:this.activeDesign.activeAssembly} );
    
  }
  
  /* temporary only */
  saveCustomEntityTypes( typesData ){
    console.log("saving custom entity types",typesData);
  } 
  
  //FIXME: move this to asset manager/use it ??
  _saveFile( path, data ){
    let fileName = path;

    log.info("saving file to",path);




    return
    //only upload if we do not have it
    //TODO do checksum etc
    if( this._designDocs.indexOf( fileName ) > -1 ) return;
    this._designDocs.push( fileName );
  
    let uri = `${this.designsUri}${this.designName}/documents`;
    var formData = new FormData();
    let name = "test";
    formData.append(name, data, fileName);
   
    var xhr = new XMLHttpRequest();
    // Open the connection.
    xhr.open('POST', uri, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        // File(s) uploaded.
        console.log("uploaded ok");
      } else {
        console.error('An error occurred!');
      }
    };
    xhr.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
          var percentage = Math.round((e.loaded * 100) / e.total);
          console.log("upload in progress", percentage);
      }
    }, false);
    
    xhr.send(formData);
    /*var reader = new FileReader();  
     this.xhr.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
          var percentage = Math.round((e.loaded * 100) / e.total);
        }
      }, false);
    xhr.open("POST", "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php");
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    reader.onload = function(evt) {
      xhr.sendAsBinary(evt.target.result);
    };
    reader.readAsBinaryString(file);*/
  }
  
   /* TODO: how about reusing the asset manager????
    also : only load data for files actually use in assembly
  */
  loadFilesList( ){
    let self = this;
     let apiUri = "http://localhost:3080/api/";
      let uri = `${apiUri}designs/${this.activeDesign.name}/documents`;
      
      var xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          console.log("fetched ok");
          console.log(this.responseText);
          let data = JSON.parse( this.responseText );
          data = data.filter( function( entry ){
            let ext = entry.split(".").pop();
            return ( ext.toLowerCase() === "stl");
          });
          if( callback ) callback( data );
          
          self._designDocs = data;
          
        } else {
          console.error('An error occurred!');
        }
      };
      xhr.send();
  }
  
}


export default TestApi
