import logger from 'log-minim'

let log = logger("design");
log.setLevel("debug");


const defaults = {
  name:        "untitled design",
  description: "Some description",
  version:     "0.0.0",
  authors:     [],
  tags:        [],
  licenses:    [],
  meta:        undefined,
}

//model ??
function Design(){
  

}



//external sink etc
let dataApi = import xxxx

function dataSink(dataApi){

  function saveMetaData( data ){
    log.debug("ATTEMPTING TO SAVE DESIGN META", data)
    dataApi.saveDesignMeta( data )
  }

}
