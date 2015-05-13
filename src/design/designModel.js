import logger from 'log-minim'

let log = logger("design");
log.setLevel("debug");


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
