import { generateUUID } from "./utils";

/*** 
*Base class for ...lots of things
***/
class Entity{
  constructor(){
    this.iuid = generateUUID(); //each instance needs a unique uid
  }
}

export default Entity ;
