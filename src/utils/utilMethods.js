function extractMeshFromResource(resource) { 
  return resource.data
}

//generic utilities for rxjs
function logNext( next ){
  log.info( next )
}
function logError( err){
  log.error(err)
}

///
/*validator for design title: why is this here*/
let validateTitle = function( inputTile ){
  return inputTile;
}

//check if the same design name already exists
let checkForDesignNameAvailability = function( inputTile){
}