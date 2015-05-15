import { generateUUID } from "./utils";

/*
export let setEntityBBox = createAction()

/*set entities as selectedd*/
export let selectEntities = createAction()

/*add new entities to active assembly*/
export let addEntityInstances$ = createAction()

/*add new entity type*/
export let addEntityType$ = createAction()

/*delete given entities*/
export let deleteEntities$ = createAction()

/*duplicate given entitites*/
export let duplicateEntities$ = createAction()

/*set entity data : FIXME : merge all the above ?*/
export let setEntityData$ = createAction()

/*var bla = objectsTransform
    .debounce(16)
    .filter(entitiesOnly)
 
    var eId = bla.map(getEntity).map('.iuid').toProperty(-1)
    var pos = bla.map('.position').map(toArray).toProperty([0,0,0])
    var rot = bla.map('.rotation').map(toArray).toProperty([0,0,0])
    var sca = bla.map('.scale').map(toArray).toProperty([0,0,0])
     
    var endTranforms = Bacon.combineTemplate(
      {entityId:eId, 
       pos:pos,
       rot:rot,
       sca:sca}
    ).onValue(function(value){
      console.log("transforms value",JSON.stringify(value))
    })*/

const defaults = {
  name:        "untitled design",
  iuid:  generateUUID() //each instance needs a unique uid
}


let Entity = Bacon.combineTemplate(
  instUid: null, 
  pos:null,
  rot:null,
  sca:null,
  color:null,

).toProperty(defaults)


function makeMod$(intent){


  //all the different "actions/observables that can change our model"
  return merge(
    addEntityInstances$, deleteEntities$, selectEntities$, duplicateEntities$,
    setEntityData$
  )
}


function model__Entities(intent, source) {
  let modification$ = makeMods$(intent)
  let route$ = Cycle.Rx.Observable.just('/').merge(intent.changeRoute$)

  return modification$
    .merge(source.todosData$)
    .scan((todosData, modFn) => modFn(todosData))
    .combineLatest(route$, determineFilter)
    .shareReplay(1)
}


///////////////////////////
//from cycle.js example


function makeModification$(intent) {
  let clearInputMod$ = intent.clearInput$.map(() => (todosData) => {
    todosData.input = '';
    return todosData;
  });

  let addEntityInstances$ = intent.addEntityInstances$.map((todoTitle) => (todosData) => {
    let lastId = todosData.list.length > 0 ?
      todosData.list[todosData.list.length - 1].id :
      0;
    todosData.list.push({
      id: lastId + 1,
      title: todoTitle,
      completed: false
    });
    todosData.input = '';
    return todosData;
  });

  let editTodoMod$ = intent.editTodo$.map((evdata) => (todosData) => {
    let todoIndex = searchTodoIndex(todosData.list, evdata.id);
    todosData.list[todoIndex].title = evdata.content;
    return todosData;
  });

  let toggleTodoMod$ = intent.toggleTodo$.map((todoid) => (todosData) => {
    let todoIndex = searchTodoIndex(todosData.list, todoid);
    let previousCompleted = todosData.list[todoIndex].completed;
    todosData.list[todoIndex].completed = !previousCompleted;
    return todosData;
  });

  let toggleAllMod$ = intent.toggleAll$.map(() => (todosData) => {
    let allAreCompleted = todosData.list
      .reduce((x, y) => x && y.completed, true);
    todosData.list.forEach((todoData) => {
      todoData.completed = allAreCompleted ? false : true;
    });
    return todosData;
  });

  let deleteTodoMod$ = intent.deleteTodo$.map((todoid) => (todosData) => {
    let todoIndex = searchTodoIndex(todosData.list, todoid);
    todosData.list.splice(todoIndex, 1);
    return todosData;
  });

  let deleteCompletedsMod$ = intent.deleteCompleteds$.map(() => (todosData) => {
    todosData.list = todosData.list
      .filter(todoData => todoData.completed === false);
    return todosData
  });

  return Cycle.Rx.Observable.merge(
    insertTodoMod$, deleteTodoMod$, toggleTodoMod$, toggleAllMod$,
    clearInputMod$, deleteCompletedsMod$, editTodoMod$
  );
}

function model(intent, source) {
  let modification$ = makeModification$(intent);
  let route$ = Cycle.Rx.Observable.just('/').merge(intent.changeRoute$);

  return modification$
    .merge(source.todosData$)
    .scan((todosData, modFn) => modFn(todosData))
    .combineLatest(route$, determineFilter)
    .shareReplay(1);
}