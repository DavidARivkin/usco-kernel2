
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
  
  isNodePresent( node ){
    //TODO: refactor: very ugly
    for(var i=0;i<this.children.length;i++)
    {
      var child = this.children[ i ];
      if( node === child )
      {
        return true;
      }
      var res = child.isNodePresent( node );
      if(res === true) return res;
    }
    return false;
  }
  
}

//experimental assembly
class Assembly extends ANode{
  constructor(){
    super();
  }
  
  getParentNode( node ){
    //if( !node._parent ) return undefined;
    //return node._parent;
    //TODO: do actual implementation for multiple levels
    var parent = undefined;
    for(var i=0;i<this.children.length;i++)
    {
      var child = this.children[ i ];
      if( node === child )
      {
        parent = this;
        break;
      }
    }
    return parent;
  }
 
}

export { Assembly }
