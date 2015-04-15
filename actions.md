

Design:
- create 
- read 
- update
- destroy
DUUUH !!


Other (MAIN)
- importMeshForEntity

- SelectEntity
- UnselectEntity
- duplicateEntity
- deleteEntity

- moveEntity
- rotateEntity
- scaleEntity

- setEntityParam:
  - name
  - color

Assembly
  - addNode
  - removeNode
  - setNodeParent
  
Annotations:
  - addAnnotation
  - removeAnnotation
  - addNoteToAnnotation
  
  - show/Hide all Annotations
  - un/highlight all annotations (make translucent/normal)
  
Bom
  - selectEntry     ---> linked to selectedEntities & selectedMeshes
  - removeEntry     ---> linked to part instance
  - changeEntryName ---> linked to part type (klass name)
  - updateEntryVersion ---> ???
  
TODO:
-----

- explicit vs implicit knowledge of actions : ie broadcast vs subscribe ?
 should the code that wants to react to a specific action either "require" the actions, listen to them via
 named xxx or somethin' else ?
- ordering of event handlers is underminable...
- make use of yield, generators etc : to unify api regardless of sync/ async implementation
- interdependencies: annotations are also entities, that somehow need to be reprensented **and injected
into the assembly in one way or the other**
- change endless loops : selectedMeshes vs selectedEntities vs selectedBomEntries
- storage
- undo redos & immutable data structures
 
 

