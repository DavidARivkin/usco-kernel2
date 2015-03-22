

class TestApi{
  constructor(){
    let testUri = "http://localhost:3080/api/designs/";
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
  
}


export { TestApi }
