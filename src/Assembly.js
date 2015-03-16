
class ANode{
  constructor(){
    this.children = [];
  }

  add( item ){
    this.children.push( item );
    //item._parent = this;//not sure
  }
  
  remove( item ){
    var idx = this.children.indexOf( item );
    if( idx > -1 ){
      this.children.splice( idx, 1 );
    }
  }
  
}

//experimental assembly
class Assembly extends ANode{
  constructor(){
    super();
  }
  
  getNodeParent( node ){
    if( !node._parent ) return undefined;
    return node._parent;
    //TODO: work different implementation that does not change data structre of injected items
    /*this.children.map( function( childNode ) {
    
    });*/
  }
}

export { Assembly }
