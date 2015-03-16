
class ANode{
  constructor(){
    this.children = [];
  }

}

//experimental assembly
class Assembly extends ANode{
  constructor(){
    super();
  }
  
  add( item ){
    this.children.push( item );
  }
}

export { Assembly }
