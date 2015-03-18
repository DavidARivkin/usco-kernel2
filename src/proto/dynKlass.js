'use strict'

class BaseClass {
  constructor( name ){
    this.name = name || "foo";
  }
  
 testMethod(){
  console.log("testMethod in baseclass", this);
 }
}

var makeKlass = function( klassName ){

  var expClassStr = `class ${klassName}{
      constructor( options ){
        this.foo = 23;
      }
      
      testMethod(){
        console.log("this", this);
      }
  }`;
  
  /*function MyKlass(len) {
    var inst = new Array(len);
    inst.__proto__ = MyArray.prototype;
    return inst;
  }
  Stack.prototype = Object.create(Array.prototype);  */

  let klass = eval( expClassStr );
  let inst = new klass();
  inst.testMethod();
  console.log("klass infos:",klass);
 
  /*let GreatCar = klass;
  let inst2 = new GreatCar();
  console.log("klass infos2:",GreatCar);*/
  
  console.log("proto", klass.__proto__,"prototype", klass.prototype);
}

var makeNamedSubKlass= function (name){
  console.log("making named class");
  
  /*let subKlass = {
      constructor( options ){
        super.constructor( options );
      }
  };*/
  
  //FIXME : horrible
  var expSubClassStr = `class ${name} extends BaseClass{
      constructor( options ){
        super( options );
      }
  }`;
  
  
  let klass = eval( expSubClassStr );
  let inst = new klass();
  inst.testMethod();
  console.log("klass infos:",klass);
  console.log("proto", klass.__proto__,"prototype", klass.prototype);
  console.log("more infos", klass.__proto__.name,"  ",klass.prototype.__proto__.name," ",klass.super);
  
  
  let Scooby = klass;
  
  class SubSubClass extends Scooby{
    constructor( options ){
      super( options );
    }
  }
  let subInst = new SubSubClass();
  console.log("subInst", subInst );
  console.log("subsubKlass", SubSubClass );
  //Object.create(new.target.prototype);
  /*console.log("part pre change", instance);
  instance.__proto__ = testKlass;
  console.log("part post change", instance);*/
}


///////////////////
makeKlass( "GreatCar" );
makeNamedSubKlass( "GreatCarSub" );

