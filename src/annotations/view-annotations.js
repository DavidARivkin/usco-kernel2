  annotationsChanged:function( oldAnnotations, newAnnotations ){
        console.log("annotations changed");
        //FIXME: needed because of some strange behaviour not filling old/new params correctly
        var removedAnnotations = [];
        if(oldAnnotations){
          if(oldAnnotations.length == 1)
          {
            var curData = oldAnnotations[0];
            var newAnnotations = [];
            if("removed" in curData ){
              //console.log("array observer");
              if("addedCount" in curData && curData.addedCount > 0 )
              {
                newAnnotations = [ this.annotations[ curData.index ] ];
              }
              removedAnnotations = curData.removed;
            }
          }
        }
        //console.log("annotationschanged", "old", oldAnnotations, "new", newAnnotations, "this",this.annotations);
        var self = this;
        var Q = require("q");
        
        for(var i=0;i<removedAnnotations.length;i++)
        {
          console.log("removedAnnotations",removedAnnotations[ i ]);
          var removedAnnotation = removedAnnotations[ i ];
          
          for(var j=0;j<self._annotationMeshes.length;j++)
          {
            var mesh = self._annotationMeshes[ j ];
            if( removedAnnotation.uuid == mesh.userData.data.uuid )
            {
              if( mesh.parent ) mesh.parent.remove( mesh );
              //delete self._annotationMeshes[ j ];
            }
          }
        }        
        
        for(var i=0;i<newAnnotations.length;i++)
        {
          addAnnotation( newAnnotations[i] );
        }
        
        function addAnnotation( annotationData ){
          var annotationHelper = null;
          
          var annotation = {};
          //fixme: hack:
          annotation._orig = annotationData;
          
          for (var key in annotationData)
          {
            if(["position","normal","orientation","center","start","mid","end","entryPoint","exitPoint"].indexOf( key ) > -1 )
            {
              annotation[key] = new THREE.Vector3().fromArray( annotationData[key] );
            }
            else if(["object","startObject","midObject","endObject"].indexOf( key ) > -1 ){
              if(!annotation._instances) annotation._instances = {};
              annotation._instances[key] = annotationData[key];//push( annotationData[key] );
            }
            else{
              annotation[key] = annotationData[key];
            }
          }
          //console.log("annotation",annotation);
          
          var partMeshesToWaitFor = [];
          var argNames = [];
          for( var key in annotation._instances  )//var i=0;i<annotation._instances.length;i++)
          {
            var partId = annotation._instances[key];
            
            if(!self.partWaiters[ partId ] )
            {
              self.partWaiters[ partId ] = Q.defer();
            }
            partMeshesToWaitFor.push( self.partWaiters[ partId ].promise );
            argNames.push( key );
            
            //resolve all waiters where: FIXME : WTH horrible hack???
            if( partId in self.parts)
            {
              self.partWaiters[ partId ].resolve( self.parts[ partId ] );
            }
          }
          //only add annotation once ALL its dependency parts have been loaded
          Q.all( partMeshesToWaitFor ).then(function(res)
          {
            for(var i=0;i<argNames.length;i++)
            {
              var key = argNames[i];
              annotation[key] = res[i];
            }
            finalizeAnnotation();
          });
          
          function finalizeAnnotation(){
            var annotationHelper = null;
            switch(annotation.type)
            {
              case "distance":
                              console.log("distance");
                var annotationHelper = new DistanceHelper({
                  //TODO mix global settings with specifics nicely
                  arrowColor:self.settings.visuals.arrowColor,
                  textColor: self.settings.visuals.textColor,
                  textBgColor:self.settings.visuals.textBgColor,
                  fontSize: self.settings.visuals.fontSize,
                  fontFace: self.settings.visuals.fontFace,
                  fontWeight: self.settings.visuals.fontWeight,
                  
                  start:annotation.start, 
                  end:annotation.end,
                  startObject:annotation.startObject,
                  endObject:annotation.endObject
                  });
                //annotationHelper.position.sub( annotation.startObject.position );
                //annotation.startObject.add( annotationHelper );
                //annotationHelper.set( {start:annotationHelper.start, end:annotationHelper.end} );
                annotationHelper.updatable = true;
                //FIXME: hack and hack !!
                var pseudoParent = self.parentNode.host.threeJs;
                console.log("annotation.startObject.parent",annotation.startObject.parent,pseudoParent);
                //annotation.startObject.parent.add( annotationHelper );
                
                //TODO: uughh do not like this
                //this.threeJs.updatables.push( annotationHelper ); 
                
                pseudoParent.addToScene( annotationHelper, "main", {autoResize:false, autoCenter:false, persistent:false, select:false } );
                
              break;
              case "thickness":
                var annotationHelper = new ThicknessHelper({
                  //TODO mix global settings with specifics nicely
                  arrowColor:self.settings.visuals.arrowColor,
                  textColor: self.settings.visuals.textColor,
                  textBgColor:self.settings.visuals.textBgColor,
                  fontSize: self.settings.visuals.fontSize,
                  fontFace: self.settings.visuals.fontFace,
                  fontWeight: self.settings.visuals.fontWeight,
                  
                  thickness: annotation.thickness, 
                  entryPoint:annotation.entryPoint,
                  exitPoint :annotation.exitPoint,
                  object    :annotation.object
                  });
                  
                annotation.object.add( annotationHelper );
              break;
              
              case "diameter":
                var annotationHelper = new DiameterHelper({
                  //TODO mix global settings with specifics nicely
                  arrowColor:self.settings.visuals.arrowColor,
                  textColor: self.settings.visuals.textColor,
                  textBgColor:self.settings.visuals.textBgColor,
                  fontSize: self.settings.visuals.fontSize,
                  fontFace: self.settings.visuals.fontFace,
                  fontWeight: self.settings.visuals.fontWeight,
                  
                  diameter:annotation.value, 
                  orientation:annotation.orientation,
                  center:annotation.center,
                  tolerance:annotation.tolerance});
                  
                annotation.object.add( annotationHelper );
              break;
              case "angle":
                var annotationHelper = new AngularDimHelper({
                  //TODO mix global settings with specifics nicely
                  arrowColor:self.settings.visuals.arrowColor,
                  textColor: self.settings.visuals.textColor,
                  textBgColor:self.settings.visuals.textBgColor,
                  fontSize: self.settings.visuals.fontSize,
                  fontFace: self.settings.visuals.fontFace,
                  fontWeight: self.settings.visuals.fontWeight,
                  
                  start:annotation.start, 
                  mid: annotation.mid, 
                  end:annotation.end,
                  startObject:annotation.startObject,
                  midObject:annotation.midObject,
                  endObject:annotation.endObject});
                  
                annotation.startObject.add( annotationHelper );
              break;
              case "note":
                var annotationHelper = new NoteHelper({
                  //TODO mix global settings with specifics nicely
                  arrowColor:self.settings.visuals.arrowColor,
                  textColor: self.settings.visuals.textColor,
                  textBgColor:self.settings.visuals.textBgColor,
                  fontSize: self.settings.visuals.fontSize,
                  fontFace: self.settings.visuals.fontFace,
                  fontWeight: self.settings.visuals.fontWeight,
                  
                  point:annotation.position, 
                  object:annotation.object})
               
                annotation.object.add( annotationHelper );
            }
            
            annotationHelper._orig = annotation._orig;
            //add pointer back to original data
            annotationHelper.userData.data = annotation._orig;
            //store annotation object/mesh
            self._annotationMeshes.push( annotationHelper );
            
            //set visibility
            if(self.showAnnotations){
              annotationHelper.show();
            }else
            {
              annotationHelper.hide();
            }
            
          }
        }
      },
