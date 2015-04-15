

class TestApi{
  constructor(){
    this.apiUri    = "http://localhost:3080/api/";
    this.designsUri = this.apiUri+"designs/";
    
    this.designName = "";
    //TODO: use our pre-exising "stores"
    this._designDocs = [];
  }


  getUserDesign(user,options){


  }
  
  saveDesign( design, options ){
    console.log("saving design", design);
    //var co = require('co');
  }
  
  loadDesign( uri, options ){
    console.log("loading design from", uri);
    
     //TODO: should look more like this
    //let design = yield this.dataApi.loadDesign( uri , options ); 
    
    //this.loadActiveAssemblyState( );
    //now get back mapping of fileName to uid
    let meshNameToPartTypeUId = localStorage.getItem("jam!-meshNameToPartTypeUId" );
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
    
    let apiUri = "http://localhost:3080/api/";
    let uri = `${apiUri}designs/${this.activeDesign.name}/assemblies/0`;
    var xhr = new XMLHttpRequest();
    // Open the connection.
    xhr.open('POST', uri, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
      if (xhr.status === 200) {
        // File(s) uploaded.
        console.log("assembly uploaded ok");
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
    
    xhr.send(strForm);
  }
  
  loadAssemblyState( ){
    let self = this;
    let apiUri = "http://localhost:3080/api/";
    let uri = `${apiUri}designs/${this.activeDesign.name}/assemblies/0`;
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("fetched ok");
        console.log(this.responseText);
        let strAssembly = this.responseText;
        strAssembly = JSON.parse( strAssembly );
        self.activeDesign.activeAssembly = new Assembly( strAssembly );
        if(callback) callback();
        
      } else {
        console.error('An error occurred!');
      }
    };
    xhr.send();
  }
  
  /* temporary only */
  saveCustomEntityTypes( typesData ){
    console.log("saving custom entity types",typesData);
  } 
  
  
  //FIXME: move this to asset manager/use it ??
  saveFile( path, data ){
    let fileName = path;
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
