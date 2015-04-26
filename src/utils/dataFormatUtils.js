//console.log("OUTPUTBOM",bom, tmpOutputBom)
      //console.log("OUTPUTASSEMBLY",tmpOutputAssembly)
      function extractTypeIdFromDescription(inputDescription){
        let key = bomEntry.description.split("part ").pop();
        let typeUid = parseInt(key);
        return typeUid;
      }

      function descriptionFormatter(inputDescription){
        let outputDescription = inputDescription.split("part ").shift();
        return outputDescription.trim();
      }

      //generate new outputs with new uids
      function generateNewTypeUidMapping( inputBom, inputAssembly, idGenerator=generateUUID){
        let outBom      = Object.assign([],inputBom);
        let outAssembly = Object.assign({},inputAssembly);

        outBom.map(function(bomEntry){
          let originalTypeId = bomEntry.id;
          let newTypeId      = idGenerator();
          bomEntry.id = newTypeId;
          bomEntry.description = descriptionFormatter(bomEntry.description);
          
          outAssembly.children.map(function(assemblyEntry){
            if(assemblyEntry.typeUid == originalTypeId){
              assemblyEntry.typeUid = newTypeId;
            }
          });

        })  

        let outAssemblies = [outAssembly];
        console.log("OUTPUTBOM",JSON.stringify(outBom) );
        console.log("OUTPUTASSEMBLY",JSON.stringify( outAssemblies) );
  
      }
      generateNewTypeUidMapping( tmpOutputBom, tmpOutputAssembly )