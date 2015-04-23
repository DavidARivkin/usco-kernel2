function loadMesh(uriOrData){
      let meshLoadParams= {
        parentUri:uri[0],
        keepRawData:true, 
        parsing:{useWorker:true,useBuffers:true} 
      }
      //FIXME: big hACK!!
      uriOrData = "./"+uriOrData
      let resource = self.assetManager.load( uriOrData, meshLoadParams );
      var $mesh = fromPromise(resource.deferred.promise);

      function extractMeshFromResource(resource) { return resource.data}
       
      let mesh = $mesh.take(1).map(extractMeshFromResource).map(postProcessMesh)
      return mesh;
    }


//deal with all meshes (fetch etc)
    function getMeshesToLoad(data){
      return data._neededMeshUrls;
    }


    
    let $meshes = $designData
      .map(getMeshesToLoad)
      .flatMap(Rx.Observable.from)
      .map(loadMesh);
      //.subscribe( logNext, logError );

    //instanciate design
    function getDesignData(data){
      return data.design;
    }
    function createDesign(designData){
      let design = new Design(designData);
      return design;
    }

    let $design = $designData
      .map(getDesignData)
      .map(createDesign);
      //.subscribe( logNext, logError );
    

    //instanciate assembly
    function getAssemblyData(data){console.log(data);return data.assemblies[0]}

    function reloadActiveAssembly(assemblyData){

      /*log.info("assemblyData",assemblyData);
      let typeUids = new Set();
      assemblyData.children.map(function(child){
        typeUids.add( child.typeUid );
      });

      log.info("typeUids",typeUids)*/
      /*let map = {
        1138741168:"63d1c05f-1fa0-4962-b158-c38da15a7c16", 
        342879467:"609b1001-5c8e-46d7-8132-4de4600921df", 
        -1220929317:"7cdab112-b6ff-4d88-bcc7-6832bf254809", 
        -1266603563:"06d9f700-5669-4711-bea8-a5f20703ae08"
      }*/

      return self.activeDesign.activeAssembly = new Assembly( assemblyData );
    }

    let $assembly = $designData
      .map(getAssemblyData)
      .map(reloadActiveAssembly);
      //.subscribe( logNext, logError );


    //deal with bom
    function getBomData(data){return data.bom}

    function extractBomInfos(bomData){
      let data = {}
      bomData.map(function(bomEntry){
        log.info(bomEntry)
        let key = bomEntry.description.split("part ").pop();
        data[key]= bomEntry.id;

        if(bomEntry.impletementation){
          
          if(bomEntry.implementations && bomEntry.implementations.default){
            let meshFileUri = bomEntry.implementations.default;
          }
          let visualKey = undefined;
          let bomId = bomEntry.id;

        }
      })
      
      log.info("BOMDATA",data)
      return bomData
    }

    let $bom = $designData
      .map(getBomData)
      .map(extractBomInfos);
      //.subscribe( logNext, logError );

    /////do final treatment
    function generateResult(assembly,bom, meshes){
      log.info(assembly, bom, meshes)
      return ""
    }

    var source = Rx.Observable.combineLatest(
        $assembly,
        $bom,
        $meshes.concatAll(),
        generateResult
    ).subscribe( logNext, logError );


    //return source;

    return deferred.promise;