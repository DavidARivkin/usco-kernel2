

class TestApi{
  constructor(){
    this.apiUri    = "http://localhost:3080/api/";
    this.designsUri = this.apiUri+"designs/";
    
    this.designName = "";
    //TODO: use our pre-exising "stores"
    this._designDocs = [];
  }

  
  saveDesign( design, options ){
    console.log("saving design", design);
    //var co = require('co');
  }
  
  loadDesign( uri, options ){
    console.log("loading design from", uri);
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
  
  
}


export { TestApi }
