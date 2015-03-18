!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.UscoKernel=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ANode = (function () {
  function ANode() {
    _classCallCheck(this, ANode);

    this.children = [];
  }

  _createClass(ANode, {
    add: {
      value: function add(item) {
        this.children.push(item);
        //item._parent = this;//not sure
      }
    },
    remove: {
      value: function remove(item) {
        var idx = this.children.indexOf(item);
        if (idx > -1) {
          this.children.splice(idx, 1);
        }
      }
    },
    isNodePresent: {
      value: function isNodePresent(node) {
        //TODO: refactor: very ugly
        for (var i = 0; i < this.children.length; i++) {
          var child = this.children[i];
          if (node === child) {
            return true;
          }
          var res = child.isNodePresent(node);
          if (res === true) {
            return res;
          }
        }
        return false;
      }
    }
  });

  return ANode;
})();

//experimental assembly

var Assembly = (function (_ANode) {
  function Assembly() {
    _classCallCheck(this, Assembly);

    _get(Object.getPrototypeOf(Assembly.prototype), "constructor", this).call(this);
  }

  _inherits(Assembly, _ANode);

  _createClass(Assembly, {
    getParentNode: {
      value: function getParentNode(node) {
        //if( !node._parent ) return undefined;
        //return node._parent;
        //TODO: do actual implementation for multiple levels
        var parent = undefined;
        for (var i = 0; i < this.children.length; i++) {
          var child = this.children[i];
          if (node === child) {
            parent = this;
            break;
          }
        }
        return parent;
      }
    }
  });

  return Assembly;
})(ANode);

exports.Assembly = Assembly;

},{}],2:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var generateUUID = require("./utils").generateUUID;

/*** 
*Base class for ...lots of things
***/

var Entity = function Entity() {
  _classCallCheck(this, Entity);

  this.iuid = generateUUID(); //each instance needs a unique uid
};

exports.Entity = Entity;

},{"./utils":8}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Entity = require("./Entity").Entity;

var generateUUID = require("./utils").generateUUID;

/*** 
*Base class for defining "parts"
***/

var Part = (function (_Entity) {
  function Part(options) {
    _classCallCheck(this, Part);

    var DEFAULTS = {
      typeUid: undefined, //part id, common for all instances of a given part
      typeName: undefined, //part CLASS name : common for all instances of a given part
      name: "",
      color: "#FFFFFFFF",
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    };
    //this.DEFAULTS = DEFAULTS;
    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(Part.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);
  }

  _inherits(Part, _Entity);

  _createClass(Part, {
    clone: {
      value: function clone() {
        var clone = new Part({ name: this.name, color: this.color, pos: this.pos, rot: this.rot, sca: this.sca });
        clone.typeUid = this.typeUid;
        clone.typeName = this.typeName;

        return clone;

        /*let keys = Object.keys( this.DEFAULTS );
        let fieldMap = {};
        let self = this;
        keys.map( function( key ){
          fieldMap[ key ] = self[ key ];
        });
        
        let clone = Object.create( this.__proto__, fieldMap );//prototype or __proto__ ??
        clone.puid  = this.puid;
        clone.pname = this.pname;
        return clone;*/
      }
    }
  }, {
    consolidateToNewClass: {

      /*create a new , named Part sub class*/

      value: function consolidateToNewClass(name, klass) {
        if (!name) throw new Error("No name provided to create new derived class");
        if (!klass) throw new Error("No class provided to create new derived class");
      }
    }
  });

  return Part;
})(Entity);

//"hurrah" for no class attributes...
Part.prototype.test = "foobar";
//assign id for the CLASS itself, common for all instances
//TODO: perhaps subclassing makes more sense ? ie create a new custom class
Part.prototype.id = generateUUID();

exports.Part = Part;

},{"./Entity":2,"./utils":8}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var generateUUID = require("./utils").generateUUID;

var Part = require("./Part").Part;

//FIXME: how much of an overlap with bom ?
//FIXME: how much of an overlap with asset manager?

var PartRegistry = (function () {
  function PartRegistry() {
    _classCallCheck(this, PartRegistry);

    //container for all already loaded meshes
    //TODO : should this be a facade ?
    this.parts = {};
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partMeshTemplates = {}; //the original base mesh: ONE PER PART
    this._partMeshWaiters = {}; //internal : when
    this.partMeshInstances = {};

    //FIXME: temporary , until I find better
    this._meshNameToPartId = {};

    this.partTypes = {};
  }

  _createClass(PartRegistry, {
    addTemplateMeshForPart: {

      /* 
        adds the "template mesh" for a given part
        this will be used as a basic instance to clone for all instances
        
        FIXME: is this no close to defining a class , of which all instances are...instances?
      */

      value: function addTemplateMeshForPart(mesh, typeUid) {
        this._partMeshTemplates[typeUid] = mesh;

        //anybody waiting for that mesh yet ?
        if (this._partMeshWaiters[typeUid]) {
          console.log("resolving mesh of ", typeUid);
          this._partMeshWaiters[typeUid].resolve(mesh);
        }
      }
    },
    getEntityMesh: {

      /* wrapper abstracting whether one needs to wait for the part's mesh or not
      */

      value: regeneratorRuntime.mark(function getEntityMesh(typeUid) {
        var _this = this;

        var mesh;
        return regeneratorRuntime.wrap(function getEntityMesh$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              if (_this._partMeshTemplates[typeUid]) {
                context$2$0.next = 2;
                break;
              }

              return context$2$0.abrupt("return");

            case 2:
              if (!_this._partMeshWaiters[typeUid]) {
                _this._partMeshWaiters[typeUid] = Q.defer();
              }

              context$2$0.next = 5;
              return _this._partMeshWaiters[typeUid];

            case 5:
              mesh = context$2$0.sent;
              return context$2$0.abrupt("return", mesh);

            case 7:
            case "end":
              return context$2$0.stop();
          }
        }, getEntityMesh, this);
      })
    },
    registerPartMesh: {

      /* register a instance's 3d mesh
      this needs to be done PER INSTANCE not just once per part
      */

      value: function registerPartMesh(part, mesh, options) {
        console.log("registering part mesh");

        //the options are actually for the MESH
        //we get the name of the mesh (needed)
        var meshName = options.name || "";
        var cName = meshName.substr(0, meshName.lastIndexOf("."));
        cName = cName.replace("_", "");
        //we do not want the mesh instance to have the name of the mesh file
        options.name = cName;

        var typeUid = this._meshNameToPartId[meshName];

        //no typeUid was given, it means we have a mesh with no part (yet !)
        if (!typeUid) {

          //FIXME: instead of PART , it could be a custom class created on the fly
          var klass = Part;

          //create ...
          var dynKlass = this.makeNamedPartKlass(cName);
          //& register class
          this.partTypes[typeUid] = dynKlass;

          var part = new klass(options); //new Part( options );

          part.typeName = cName; //name of the part CLASS
          part.typeUid = generateUUID(); //FIXME implement
          typeUid = part.typeUid; //FIXME implement
          this._meshNameToPartId[meshName] = typeUid;
          this.parts[typeUid] = part;
        } else {
          part = this.parts[typeUid].clone();
          //totally absurd are we dealing with classes, instances or what???
        }

        if (!this.partMeshInstances[typeUid]) {
          this.partMeshInstances[typeUid] = [];
        }
        this.partMeshInstances[typeUid].push(mesh);

        //do we have ANY meshes for this part
        //if not, add it to templates
        if (!this._partMeshTemplates[typeUid]) {
          this.addTemplateMeshForPart(mesh.clone(), typeUid);
        }

        return part;
      }
    },
    registerPartSource: {

      /* register a part's (parametric) source
      */

      value: function registerPartSource(part, source, options) {}
    },
    registerPart: {

      /*FIXME: not sure this is needed */

      value: function registerPart(part) {
        if (!part) throw new Error("no part specified, cannot register part");
        this.parts.push(part);
      }
    },
    registerPartType: {
      value: function registerPartType(_x, typeName) {
        var partKlass = arguments[0] === undefined ? undefined : arguments[0];
      }
    },
    makeNamedPartKlass: {

      /*experimental:
       generate a named subclass of part, based on the name of Part CLASS
      */

      value: function makeNamedPartKlass(klassName) {
        console.log("making named class");

        //FIXME : won't work, as class is not support in browsers , where the eval() is taking
        //place
        /*let expSubClassStr = `class ${klassName} extends Part{
            constructor( options ){
              super( options );
            }
        }`;*/
        //SO we use the "old" es5 syntax

        var expSubClassStr = "var " + klassName + " = function(options){\n        Part.call( this, options );\n      }\n      " + klassName + ".prototype = Object.create( Part.prototype );\n      " + klassName + ".prototype.constructor = " + klassName + ";  \n    ";
        console.log("expSubClassStr", expSubClassStr);
        var klass = eval(expSubClassStr);
        /*console.log("part pre change", part);
        part.__proto__ = testKlass;
        console.log("part post change", part);*/
        console.log("klass", klass);
        return klass;
      }
    }
  });

  return PartRegistry;
})();

exports.PartRegistry = PartRegistry;
//partMeshesToWaitFor.push( self.partWaiters[ typeUid ].promise );

},{"./Part":3,"./utils":8}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BomEntry = function BomEntry(name, description, version, amount, unit, parameters) {
  _classCallCheck(this, BomEntry);
};

var Bom = (function () {
  function Bom() {
    _classCallCheck(this, Bom);

    //TODO: ermmm bom within bom?
    this.bom = [];

    //mappings between part types and their bom entries: ie one bom entry per class + params
    this.partTypeToBomEntryMap = new WeakMap();
  }

  _createClass(Bom, {
    registerPart: {

      //basic api

      value: function registerPart(partData, _x, instances) {
        var implementations = arguments[1] === undefined ? {} : arguments[1];

        var DEFAULTS = {
          name: "",
          description: "",
          version: "0.0.0",
          qty: 0,
          physicalQty: 0, //this can be used for weight, distance etc
          unit: "EA", //this applies to the physicalQty field
          parameters: "",
          implementations: {}, //without defaults to "default":"xxx.stl"

          //FIXME: hack field? shoud this be in another data structure ?
          _instances: {} //same keys as implementations, values are in memory instances ie "meshes"
        };

        var partData = Object.assign({}, DEFAULTS, partData);
      }
    },
    registerInstance: {

      /*
        register an instance 
      
      */

      value: function registerInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("Not existing partId specified");

        //console.log("registering", instance, "as instance of ", bomEntry.name );
        bomEntry._instances.push(instance);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty += 1;
      }
    },
    unRegisterInstance: {

      /*remove an instance 
      
      */

      value: function unRegisterInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("bad partId specified");

        var index = bomEntry._instances.indexOf(instance);
        if (index == -1) {
          return;
        }bomEntry._instances.splice(index, 1);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty -= 1;
      }
    },
    registerImplementation: {

      /*
        Register an IMPLEMENTATIOn in the bom: 
        an implementation is a key-value pair : 
          *key : the SOURCE (a parametric file used
        to generate a mesh) 
          *value: the concrete 
          for example a mesh/ mesh file (stl , amf)
        
        why an implementation ? because an entity/part can be created in different
        software, different formats etc, it still remains the same entity
        
        for example :
          {"cad/case.scad":"cad/case-top-0.0.1.stl"}
      */

      value: function registerImplementation(partName, meshUri) {
        console.log("registering", meshUri, "as implementation of ", partName);
        if (!partName) throw new Error("no part name specified");

        /*var partIndex = -1;
        var bomEntry = null;
        
        for(var i=0;i<this.bom.length;i++)
        {
          var entry = this.bom[i];
          partIndex = i;
          if(entry.name === partName)
          {
            bomEntry = entry;
            break;
          }
        }*/
        var bomEntry = this.getPartByName(partName);

        if (!bomEntry) {
          partIndex += 1;
          bomEntry = {
            id: partIndex,
            name: partName,
            description: "",
            version: "0.0.1",
            qty: 0,
            unit: "EA",
            url: "",
            implementations: { "default": meshUri },
            parameters: "",
            _instances: [],
            _instances2: {}
          };
          this.bom.push(bomEntry);
        }

        console.log("BOM", this.bom);
        return partIndex;
      }
    },
    getPartByName: {

      //helpers and extras

      value: function getPartByName(partName) {
        var res = this.bom.find(function (entry) {
          return entry.name === partName;
        });
        if (matches.length > 0) {
          return res[0];
        }return undefined;
      }
    },
    getPartNames: {

      /*retrieve all part names*/

      value: function getPartNames() {
        var partNames = this.bom.map(function (obj) {
          return obj.name;
        }); //return obj.name
        return partNames;
      }
    },
    isPartNameInBom: {

      /*find out if a part (name) is already in the bom*/

      value: function isPartNameInBom(partName) {
        var matches = this.getPartByName(partName);
        if (matches) {
          return true;
        }return false;
      }
    },
    isPartImplementationInBom: {

      /* find out if an implementation name already exists in the bom*/

      value: function isPartImplementationInBom(implementationName) {
        for (var i = 0; i < this.bom.length; i++) {
          var entry = this.bom[i];
          var implemNames = Object.keys(entry.implementations).map(function (key) {
            return entry.implementations[key];
          });

          if (implemNames.includes(implementationName)) {
            return true;
          }
        }
        return false;
      }
    },
    addEmtpyEntry: {

      /*inject an empty entry */

      value: function addEmtpyEntry(partName, description) {
        partIndex = this.bom.length - 1;

        bomEntry = {
          id: partIndex,
          name: partName,
          description: "",
          version: "0.0.1",
          qty: 0,
          unit: "EA",
          url: "",
          implementations: { "default": "" },
          parameters: "",
          _instances2: {}
        };

        this.bom.push(bomEntry);
      }
    },
    assignInstanceToEntry: {

      /*
        (re)assign an instance to a given entry
        //var partId = instance.userData.part.partId;
      */

      value: function assignInstanceToEntry(instance, partId) {
        this._unRegisterInstance(partId, instance);
        this._registerInstance(partId, instance);
      }
    }
  });

  return Bom;
})();

//object mixin testing
/*
Object.assign(Bom.prototype, {
    testMethod(arg1) {
      console.log("testing one two");
    }
});*/

exports.Bom = Bom;

/*this.name        = name;
this.description = "";
this.version     = "0.0.1";
this.amount      = 0;
this.unit        = "EA";
this.implementations = {};//"default":meshUri
this.parameters      = "";*/
//Object.assign(this, { x, y });

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var generateUUID = require("../utils").generateUUID;

var Assembly = require("../Assembly").Assembly;

var Design = (function () {
  function Design(options) {
    _classCallCheck(this, Design);

    var DEFAULTS = {
      uid: generateUUID(),
      name: "NewDesign",
      title: "New Design",
      description: "",
      version: "0,0.0",
      url: "",
      authors: [], //{"name":"otherGirl","url": "www.mysite.com","email":"gg@bar.baz"}
      tags: [],
      licences: ["MIT"],
      meta: { state: "design" }
    };
    this.DEFAULTS = DEFAULTS;
    var options = Object.assign({}, DEFAULTS, options);
    Object.assign(this, options);

    //setup internals
    this.resources = [];

    //assemblies
    this.assemblies = [];
    this.activeAssembly = new Assembly();
    this.assemblies.push(this.activeAssembly);
  }

  _createClass(Design, {
    switchAssemblies: {

      //swithc to a specific assembly as main/active assembly

      value: function switchAssemblies(newAssembly) {}
    },
    toJSON: {

      //configure the fields to serialize

      value: function toJSON() {
        console.log("calling toJSON method");
        var extraFields = []; //["activeAssembly"];
        var keys = Object.keys(this.DEFAULTS);

        keys = keys.concat(extraFields);
        var fieldMap = {};
        var self = this;
        keys.map(function (key) {
          fieldMap[key] = self[key];
        });
        console.log("fieldMap", fieldMap);
        return fieldMap;
      }
    }
  });

  return Design;
})();

exports.Design = Design;

//TODO implement

},{"../Assembly":1,"../utils":8}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Part = require("./Part").Part;

var PartRegistry = require("./PartRegistry").PartRegistry;

var Bom = require("./bom/Bom").Bom;

var Assembly = require("./Assembly").Assembly;

var Design = require("./design/Design").Design;

//import * from "./utils" as utils;

/**
TODO: should be singleton
**/

var Kernel = (function () {
  function Kernel() {
    _classCallCheck(this, Kernel);

    this.partRegistry = new PartRegistry();

    //not sure at ALL
    this.activeDesign = new Design();

    //essential
    this.activeAssembly = this.activeDesign.activeAssembly;

    //this should be PER assembly
    this.entitiesToMeshInstancesMap = new WeakMap();
    this.meshInstancesToEntitiesMap = new WeakMap(); //reverse map

    //not sure
    this.bom = new Bom();
  }

  _createClass(Kernel, {
    registerPart: {

      //should be part class ?

      value: function registerPart() {
        var part = arguments[0] === undefined ? undefined : arguments[0];
        var source = arguments[1] === undefined ? undefined : arguments[1];
        var mesh = arguments[2] === undefined ? undefined : arguments[2];
        var options = arguments[3] === undefined ? {} : arguments[3];

        var part = this.partRegistry.registerPartMesh(part, mesh, options);

        this.activeAssembly.add(part);
        console.log("assembly", this.activeAssembly);

        //register new instance in the Bill of materials
        this.bom.registerPart(part);
        //self._registerInstanceInBom( mesh.userData.part.bomId, mesh );
        //part.bomId = self._registerImplementationInFakeBOM( resource.uri, partName );

        //FIXME: unsure, this is both too three.js specific, and a bit weird to
        //inject data like that, mostly as we have mappings from entity to mesh already
        mesh.userData.entity = part;

        return part;
      }
    },
    getPartMeshInstance: {

      /*
        get new instance of mesh for an entity that does not have a mesh YET
      */

      value: function getPartMeshInstance(entity) {
        var mesh = this.partRegistry._partMeshTemplates[entity.typeUid].clone();
        this.registerEntityMeshRel(entity, mesh);
        return mesh;
      }
    },
    registerPartInstance: {
      value: function registerPartInstance(partInst) {}
    },
    registerEntityMeshRel: {

      /* register the mesh <-> entity  relationship
      ie : what is visual/mesh for a given mesh and vice versa:
      ie : what is the entity of a given mesh
      */

      value: function registerEntityMeshRel(entity, mesh) {
        if (!entity) throw new Error(" no entity specified for registration with mesh");
        if (!mesh) throw new Error(" no mesh specified for registration with entity");
        this.entitiesToMeshInstancesMap.set(entity, mesh);
        this.meshInstancesToEntitiesMap.set(mesh, entity);
      }
    },
    duplicateEntity: {
      value: function duplicateEntity(entity) {
        var dupe = entity.clone();
        if (entity instanceof Part) {
          this.activeAssembly.add(dupe);
          //TODO: how to deal with auto offset to prevent overlaps
        }
        return dupe;
      }
    },
    removeEntity: {

      /* removes an entity 
      WARNING: this is not the same as deleting one*/

      value: function removeEntity(entity) {
        this.activeAssembly.remove(entity);
        //FIXME: add REMOVAL FROM BOM
        /*try{
          this._unRegisterInstanceFromBom( selectedObject.userData.part.bomId , selectedObject );
        }catch(error){} //FIXME: only works for items in bom*/

        //remove entry not sure about this
        //this actually needs to be done on the visual side of things, not in the pure data layer
        /*let mesh = this.getMeshOfEntity( entity );
        this.entitiesToMeshInstancesMap.delete( entity );
        this.meshInstancesToEntitiesMap.delete( mesh );*/
      }
    },
    isEntityinActiveAssembly: {

      //helpers

      /* is the given entity part of the active assembly?*/

      value: function isEntityinActiveAssembly(entity) {
        //this.entitiesToMeshInstancesMap.has( entity );
        return this.activeAssembly.isNodePresent(entity);
      }
    },
    getMeshOfEntity: {

      /* retrieve the visual/mesh of a given entity */

      value: function getMeshOfEntity(entity) {
        return this.entitiesToMeshInstancesMap.get(entity);
      }
    },
    getEntityOfMesh: {

      /* retrieve the entity of a given mesh */

      value: function getEntityOfMesh(mesh) {
        return this.meshInstancesToEntitiesMap.get(mesh);
      }
    },
    saveDesign: {

      //FIXME after this point, very doubtfull to be kept in this form & shape

      value: function saveDesign(design) {
        var design = this.activeDesign;
        console.log("saving design", design);
        var strForm = JSON.stringify(design);
        localStorage.setItem("jam!-data-design", strForm);
      }
    },
    loadDesign: {

      //returns a fake/ testing design
      //TODO: impletement, use at least promises, or better generators/ yield

      value: function loadDesign(uri) {
        var design = new Design({ name: "GroovyDesign", title: "Groovy design", description: "a classy design" });
        return design;
      }
    },
    saveActiveAssemblyState: {
      value: function saveActiveAssemblyState() {
        var strForm = JSON.stringify(this.activeDesign.activeAssembly);
        localStorage.setItem("jam!-data-assembly", strForm);
      }
    }
  });

  return Kernel;
})();

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;

//this.assemblies.add( partInst );
//this.bom.registerInstance();

},{"./Assembly":1,"./Part":3,"./PartRegistry":4,"./bom/Bom":5,"./design/Design":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

//TODO: taken from three.js ,do correct attribution
var generateUUID = (function () {

	// http://www.broofa.com/Tools/Math.uuid.htm

	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
	var uuid = new Array(36);
	var rnd = 0,
	    r;

	return function () {

		for (var i = 0; i < 36; i++) {

			if (i == 8 || i == 13 || i == 18 || i == 23) {

				uuid[i] = "-";
			} else if (i == 14) {

				uuid[i] = "4";
			} else {

				if (rnd <= 2) rnd = 33554432 + Math.random() * 16777216 | 0;
				r = rnd & 15;
				rnd = rnd >> 4;
				uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
			}
		}

		return uuid.join("");
	};
})();

var hashCode = function hashCode(s) {
	return s.split("").reduce(function (a, b) {
		a = (a << 5) - a + b.charCodeAt(0);return a & a;
	}, 0);
};

exports.generateUUID = generateUUID;
exports.hashCode = hashCode;

},{}]},{},[7])(7)
});