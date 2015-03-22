!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.UscoKernel=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.call(ctx);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

},{}],2:[function(require,module,exports){
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
  function Assembly(options) {
    _classCallCheck(this, Assembly);

    var DEFAULTS = {};
    _get(Object.getPrototypeOf(Assembly.prototype), "constructor", this).call(this);
    var options = Object.assign({}, DEFAULTS, options);
    Object.assign(this, options);
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

},{}],3:[function(require,module,exports){
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

},{"./utils":10}],4:[function(require,module,exports){
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
      //typeUid : undefined,//part id, common for all instances of a given part
      //typeName: undefined,//part CLASS name : common for all instances of a given part
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
        //clone.typeUid  = this.typeUid;
        //clone.typeName = this.typeName;

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
//assign id for the CLASS itself, common for all instances
//TODO: perhaps subclassing makes more sense ? ie create a new custom class
Part.prototype.id = generateUUID();

exports.Part = Part;

},{"./Entity":3,"./utils":10}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});
//import { Q } from "q";
var Q = require("q");

var _utils = require("./utils");

var generateUUID = _utils.generateUUID;
var hashCode = _utils.hashCode;
var nameCleanup = _utils.nameCleanup;

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
    this._partTypeMeshTemplates = {}; //the original base mesh: ONE PER PART
    this._partTypeMeshWaiters = {}; //internal : when
    this.partMeshInstances = {};

    //FIXME: VISUALS temporary , until I find better
    this._meshNameToPartTypeUId = {};

    this.partTypes = {};
    this.partTypesByName = {};
    this.partTypeInstances = {};

    //FIXME: not sure: json representation of custom PART types, stored by typeUid
    this._customPartTypesMeta = {};
  }

  _createClass(PartRegistry, {
    addTemplateMeshForPartType: {

      /* 
        adds the "template mesh" for a given part
        this will be used as a basic MESH instance to clone for all instances
      */

      value: function addTemplateMeshForPartType(mesh, typeUid) {
        if (!this._partTypeMeshTemplates[typeUid]) {

          this._partTypeMeshTemplates[typeUid] = mesh;

          //anybody waiting for that mesh yet ?
          if (this._partTypeMeshWaiters[typeUid]) {
            console.log("resolving mesh of ", typeUid);
            this._partTypeMeshWaiters[typeUid].resolve(mesh);
          }
        }
      }
    },
    registerPartTypeMesh: {

      /* 
      register a instance's 3d mesh, 
      
        @returns: a class
      */

      value: function registerPartTypeMesh(partKlass, mesh, options) {
        console.log("registering part mesh");

        /*we also check if the implementation (the stl, amf etc) file is already registered 
        as an implementation of some part type*/

        //the options are actually for the MESH
        //we get the name of the mesh (needed)
        //we do not want the mesh instance to have the name of the mesh file
        var meshName = options.name || "";
        var cName = nameCleanup(meshName);

        var typeUid = this._meshNameToPartTypeUId[meshName];

        //no typeUid was given, it means we have a mesh with no part (yet !)
        if (!typeUid) {
          //FIXME: instead of PART , it could be a custom class created on the fly
          var klass = Part;
          typeUid = generateUUID();
          //create ...
          partKlass = this.makeNamedPartKlass(cName, typeUid);
          //& register class
          this.partTypes[typeUid] = partKlass;
          this.partTypesByName[cName] = partKlass;

          //TODO: move this to a visual specific part of the code
          this._meshNameToPartTypeUId[meshName] = typeUid;
        } else {
          partKlass = this.partTypes[typeUid];
        }

        //do we have ANY meshes for this part ?
        //if not, add it to templates
        this.addTemplateMeshForPartType(mesh.clone(), typeUid);

        return partKlass;
      }
    },
    registerPartType: {

      /* register a part type
      */

      value: function registerPartType(partKlass, typeName) {
        if (!partKlass) throw new Error("no part type specified, cannot register part type");
      }
    },
    registerPartTypeSource: {

      /* register a part type's (parametric) source
      */

      value: function registerPartTypeSource(part, source, options) {}
    },
    registerPartInstance: {

      /* register a part instance */

      value: function registerPartInstance(partInstance) {
        if (!partInstance) throw new Error("no part specified, cannot register part");
        //this.parts.push( part );
        var typeUid = partInstance.typeUid;
        if (!this.partTypeInstances[typeUid]) {
          this.partTypeInstances[typeUid] = [];
        }
        this.partTypeInstances[typeUid].push(partInstance);
      }
    },
    makeNamedPartKlass: {

      /*experimental:
       generate a named subclass of part, based on the name of Part CLASS
      */

      value: function makeNamedPartKlass(klassName, typeUid) {
        console.log("making named class");
        //FIXME : won't work, as class is not support in browsers , where the eval() is taking
        //place
        /*let expSubClassStr = `class ${klassName} extends Part{
            constructor( options ){
              super( options );
            }
        }`;*/
        //SO we use the "old" es5 syntax
        var expSubClassStr = "var " + klassName + " = function(options){\n        Part.call( this, options );\n      }\n      " + klassName + ".prototype = Object.create( Part.prototype );\n      " + klassName + ".prototype.constructor = " + klassName + ";  \n      \n      //set class attributes\n      /*" + klassName + ".prototype.typeName = '" + klassName + "';\n      " + klassName + ".prototype.typeUid = '" + typeUid + "';*/\n    ";
        console.log("expSubClassStr", expSubClassStr);
        var klass = eval(expSubClassStr);
        klass.prototype.typeName = klassName;
        klass.prototype.typeUid = typeUid;

        this._customPartTypesMeta[typeUid] = { typeName: klassName, typeUid: typeUid };

        return klass;
      }
    },
    createTypeInstance: {

      /* create a new instance of a type */

      value: function createTypeInstance(klassOrKlassName, options) {
        //let klass = this.partTypesByName[ klassName ];
        var klass = klassOrKlassName;
        var typeUid = klass.prototype.typeUid;
        var part = new klass(options);

        //Register instance
        this.registerPartInstance(part);
        //not sure
        part.name = part.typeName + "" + (this.partTypeInstances[typeUid].length - 1);
        return part;
      }
    },
    getPartTypeMesh: {

      /* wrapper abstracting whether one needs to wait for the part's mesh or not
      */

      value: regeneratorRuntime.mark(function getPartTypeMesh(typeUid) {
        var _this = this;

        var original = arguments[1] === undefined ? false : arguments[1];

        var _mesh, mesh;

        return regeneratorRuntime.wrap(function getPartTypeMesh$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              if (!(!_this._partTypeMeshTemplates[typeUid] && !_this._partTypeMeshWaiters[typeUid])) {
                context$2$0.next = 2;
                break;
              }

              throw new Error("No matching mesh found");

            case 2:

              if (!_this._partTypeMeshWaiters[typeUid]) {
                _this._partTypeMeshWaiters[typeUid] = Q.defer();
              }

              if (_this._partTypeMeshTemplates[typeUid]) {
                _mesh = _this._partTypeMeshTemplates[typeUid];

                console.log("mesh", _mesh);
                _this._partTypeMeshWaiters[typeUid].resolve(_mesh);
                //let mesh = yield this._partTypeMeshWaiters[ typeUid ];
              }

              context$2$0.next = 6;
              return _this._partTypeMeshWaiters[typeUid].promise;

            case 6:
              mesh = context$2$0.sent;

              //we have not been asked for the original mesh, get a copy instance
              if (!original) {
                mesh = mesh.clone();
              }
              return context$2$0.abrupt("return", mesh);

            case 9:
            case "end":
              return context$2$0.stop();
          }
        }, getPartTypeMesh, this);
      })
    }
  });

  return PartRegistry;
})();

exports.PartRegistry = PartRegistry;
//partMeshesToWaitFor.push( self.partWaiters[ typeUid ].promise );

},{"./Part":4,"./utils":10,"q":"q"}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var hashCodeFromString = require("../utils").hashCodeFromString;

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
    this.bomEntryToPartTypeMap = new WeakMap();
    this.partTypeAndParamsToBomEntryMap = new Map();

    this.partInstanceToBomEntryMap = new WeakMap();
  }

  _createClass(Bom, {
    registerPartType: {

      //basic api

      value: function registerPartType(partKlass) {
        var parameters = arguments[1] === undefined ? {} : arguments[1];

        console.log("registering part type in bom", partKlass);
        var DEFAULTS = {
          id: -1,
          name: partKlass.prototype.typeName,
          description: "",
          version: "0.0.0",
          qty: 0,
          physicalQty: 0, //this can be used for weight, distance etc
          unit: "EA", //this applies to the physicalQty field
          parameters: parameters,
          implementations: {}, //without defaults to "default":"xxx.stl"
          //FIXME: hack field? shoud this be in another data structure ?
          _instances: {} //same keys as implementations, values are in memory entities
        };
        var bomEntry = Object.assign({}, DEFAULTS, bomEntry);

        //A unique bom entry is a partType/uid + a given set of parameters
        var hash = hashCodeFromString(partKlass.prototype.typeUid + JSON.stringify(parameters));
        if (!this.partTypeAndParamsToBomEntryMap.has(hash)) {
          this.partTypeAndParamsToBomEntryMap.set(hash, bomEntry);
          this.bom.push(bomEntry);
          bomEntry.id = this.bom.length - 1;
        }
        //this.bomEntryToPartTypeMap.set( bomEntry, partKlass );
        //this.partTypeToBomEntryMap.set( [partKlass, parameters], bomEntry );
      }
    },
    registerInstance: {

      /*
        register an instance 
      */

      value: function registerInstance(instance) {
        var parameters = arguments[1] === undefined ? {} : arguments[1];

        if (!instance) throw new Error("No instance given");

        var hash = hashCodeFromString(instance.typeUid + JSON.stringify(parameters));
        //var bomEntry = this.bom[ partId ];
        var bomEntry = this.partTypeAndParamsToBomEntryMap.get(hash);

        if (!bomEntry) throw new Error("Bom entry not found");

        //console.log("registering", instance, "as instance of ", bomEntry.name );
        //bomEntry._instances.push( instance);
        this.partInstanceToBomEntryMap.set(instance, bomEntry);

        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty += 1;
      }
    },
    unRegisterInstance: {

      /*remove an instance 
      
      */

      value: function unRegisterInstance(instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.partInstanceToBomEntryMap.get(instance);
        if (!bomEntry) throw new Error("Bom entry not found");

        //var index = bomEntry._instances.indexOf( instance );
        //if( index == -1 ) return;
        //bomEntry._instances.splice( index, 1 );
        this.partInstanceToBomEntryMap["delete"](instance);
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

},{"../utils":10}],7:[function(require,module,exports){
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

},{"../Assembly":2,"../utils":10}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Part = require("./Part").Part;

var PartRegistry = require("./PartRegistry").PartRegistry;

var Bom = require("./bom/Bom").Bom;

var Assembly = require("./Assembly").Assembly;

var Design = require("./design/Design").Design;

var TestApi = require("./testApi/testApi").TestApi;

var _utils = require("./utils");

var generateUUID = _utils.generateUUID;
var hashCode = _utils.hashCode;
var nameCleanup = _utils.nameCleanup;

var co = require("co").co;

var Kernel = (function () {
  function Kernel() {
    _classCallCheck(this, Kernel);

    //FIXME: horrible temp hack
    this.co = co;

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

    //not sure
    this.dataApi = new TestApi();
  }

  _createClass(Kernel, {
    registerPartType: {
      value: function registerPartType() {
        var part = arguments[0] === undefined ? undefined : arguments[0];
        var source = arguments[1] === undefined ? undefined : arguments[1];
        var mesh = arguments[2] === undefined ? undefined : arguments[2];
        var options = arguments[3] === undefined ? {} : arguments[3];

        var partKlass = this.partRegistry.registerPartTypeMesh(part, mesh, options);

        //if we have meshes or sources
        if ("resource" in options) {
          var resource = options.resource;
          console.log("resource", resource);

          //TODO: clean this up, just a hack
          this.dataApi.designName = this.activeDesign.name;
          //console.log("docs of design updated", this.partRegistry._meshNameToPartTypeUId[ fileName ] );
          //TODO: store this resourceName/URI ==> uid on the server somewhere
          var meshNameToPartTypeUIdMapStr = JSON.stringify(this.partRegistry._meshNameToPartTypeUId);
          localStorage.setItem("jam!-meshNameToPartTypeUId", meshNameToPartTypeUIdMapStr);
          //we have a mesh with a resource, store the file
          this.dataApi.saveFile(resource.name, resource._file);
        }
        //save part types??
        this.dataApi.saveCustomEntityTypes(this.partRegistry._customPartTypesMeta);

        this.bom.registerPartType(partKlass);

        return partKlass;
      }
    },
    getPartMeshInstance: {

      /*
        get new instance of mesh for an entity that does not have a mesh YET
      */

      value: regeneratorRuntime.mark(function getPartMeshInstance(entity) {
        var _this = this;

        var mesh;
        return regeneratorRuntime.wrap(function getPartMeshInstance$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              context$2$0.next = 2;
              return _this.partRegistry.getPartTypeMesh(entity.typeUid);

            case 2:
              mesh = context$2$0.sent;

              //TODO: perhaps do this differently: ie return a wrapper mesh with just a bounding
              //box and "fill in"/stream in the mesh later ?
              _this.registerEntityMeshRel(entity, mesh);
              return context$2$0.abrupt("return", mesh);

            case 5:
            case "end":
              return context$2$0.stop();
          }
        }, getPartMeshInstance, this);
      })
    },
    makePartTypeInstance: {
      value: function makePartTypeInstance(partType) {
        //FIXME: unsure, this is both too three.js specific, and a bit weird to
        //inject data like that, mostly as we have mappings from entity to mesh already
        //mesh.userData.entity = part;
        return this.partRegistry.createTypeInstance(partType);
      }
    },
    registerPartInstance: {
      value: function registerPartInstance(partInst) {
        this.activeAssembly.add(partInst);
        //register new instance in the Bill of materials
        this.bom.registerInstance(partInst, {});
      }
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
      value: function duplicateEntity(originalEntity) {
        var addToAssembly = arguments[1] === undefined ? true : arguments[1];

        console.log("duplicating entity");
        //var dupe = entity.clone();
        //entity.prototype();
        var entityType = this.partRegistry.partTypes[originalEntity.typeUid];
        var dupe = this.partRegistry.createTypeInstance(entityType);
        //FIXME: do this correctly
        var doNotCopy = ["iuid", "name"];
        var onlyCopy = ["pos", "rot", "sca"];
        for (key in originalEntity) {
          console.log("key", key);
          if (onlyCopy.indexOf(key) > -1) {
            dupe[key] = Object.assign({}, originalEntity[key]);
          }
        }

        //FIXME : needs to work with all entity types
        dupe.name = dupe.typeName + "" + (this.partRegistry.partTypeInstances[dupe.typeUid].length - 1);

        if (addToAssembly) //entity instanceof Part )
          {
            this.registerPartInstance(dupe);
            //TODO: how to deal with auto offset to prevent overlaps ?
          }
        return dupe;
      }
    },
    removeEntity: {

      /* removes an entity 
      WARNING: this is not the same as deleting one*/

      value: function removeEntity(entity) {
        this.activeAssembly.remove(entity);
        this.bom.unRegisterInstance(entity);

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

      value: function loadDesign(uri, options, callback) {
        console.log("loading design from", uri);
        //FIXME: horrible
        var designName = uri.split("/").pop();
        console.log("designName", designName);
        var design = new Design({ name: designName, title: "Groovy design", description: "a classy design" });
        //FIXME horrible
        this.activeDesign.name = designName;

        return;

        //TODO: should look more like this
        //let design = yield this.dataApi.loadDesign( uri , options );

        //this.loadActiveAssemblyState( );
        //now get back mapping of fileName to uid
        var meshNameToPartTypeUId = localStorage.getItem("jam!-meshNameToPartTypeUId");
        if (meshNameToPartTypeUId) {
          meshNameToPartTypeUId = JSON.parse(meshNameToPartTypeUId);
          this.partRegistry._meshNameToPartTypeUId = meshNameToPartTypeUId;

          //FIXME: horrible hack, see code in part registry
          for (key in meshNameToPartTypeUId) {
            var klass = Part;
            var cName = nameCleanup(key);
            var _options = { name: cName };
            var part = new klass(_options); //new Part( options );
            var typeUid = meshNameToPartTypeUId[key];

            part.typeName = cName; //name of the part CLASS
            part.typeUid = typeUid;
            this.partRegistry.parts[typeUid] = part;

            this.partRegistry.registerPartInstance(part);
            //not sure
            part.name = part.typeName + "" + (this.partRegistry.partTypeInstances[typeUid].length - 1);

            //do we have ANY meshes for this part ?
            //if not, add it to templates
          }
        }

        //now that we have the list of files that we need, load those
        this.loadDocsOfDesign(callback);

        return this.activeDesign;
      }
    },
    saveActiveAssemblyState: {
      value: function saveActiveAssemblyState() {
        console.log("saving active assembly state");
        //localstorage
        var strForm = JSON.stringify(this.activeDesign.activeAssembly);
        localStorage.setItem("jam!-data-assembly", strForm);
      }
    },
    loadActiveAssemblyState: {
      value: function loadActiveAssemblyState(callback) {
        //local storage
        var strAssembly = localStorage.getItem("jam!-data-assembly");
        this.activeDesign.activeAssembly = new Assembly(strAssembly);
      }
    },
    loadDocsOfDesign: {

      /* TODO: how about reusing the asset manager????
        also : only load data for files actually use in assembly
      */

      value: function loadDocsOfDesign(callback) {
        var self = this;
        var apiUri = "http://localhost:3080/api/";
        var uri = "" + apiUri + "designs/" + this.activeDesign.name + "/documents";

        var xhr = new XMLHttpRequest();
        xhr.open("GET", uri, true);
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log("fetched ok");
            console.log(this.responseText);
            var data = JSON.parse(this.responseText);
            data = data.filter(function (entry) {
              var ext = entry.split(".").pop();
              return ext.toLowerCase() === "stl";
            });
            if (callback) callback(data);

            self._designDocs = data;
          } else {
            console.error("An error occurred!");
          }
        };
        xhr.send();
      }
    }
  });

  return Kernel;
})();

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;

},{"./Assembly":2,"./Part":4,"./PartRegistry":5,"./bom/Bom":6,"./design/Design":7,"./testApi/testApi":9,"./utils":10,"co":1}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var TestApi = (function () {
  function TestApi() {
    _classCallCheck(this, TestApi);

    this.apiUri = "http://localhost:3080/api/";
    this.designsUri = this.apiUri + "designs/";

    this.designName = "";
    //TODO: use our pre-exising "stores"
    this._designDocs = [];
  }

  _createClass(TestApi, {
    saveDesign: {
      value: function saveDesign(design, options) {
        console.log("saving design", design);
        //var co = require('co');
      }
    },
    loadDesign: {
      value: function loadDesign(uri, options) {
        console.log("loading design from", uri);
      }
    },
    saveAssemblyState: {
      value: function saveAssemblyState() {
        var strForm = JSON.stringify({ assembly: this.activeDesign.activeAssembly });

        var apiUri = "http://localhost:3080/api/";
        var uri = "" + apiUri + "designs/" + this.activeDesign.name + "/assemblies/0";
        var xhr = new XMLHttpRequest();
        // Open the connection.
        xhr.open("POST", uri, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function () {
          if (xhr.status === 200) {
            // File(s) uploaded.
            console.log("assembly uploaded ok");
          } else {
            console.error("An error occurred!");
          }
        };
        xhr.upload.addEventListener("progress", function (e) {
          if (e.lengthComputable) {
            var percentage = Math.round(e.loaded * 100 / e.total);
            console.log("upload in progress", percentage);
          }
        }, false);

        xhr.send(strForm);
      }
    },
    loadAssemblyState: {
      value: function loadAssemblyState() {
        var self = this;
        var apiUri = "http://localhost:3080/api/";
        var uri = "" + apiUri + "designs/" + this.activeDesign.name + "/assemblies/0";

        var xhr = new XMLHttpRequest();
        xhr.open("GET", uri, true);
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log("fetched ok");
            console.log(this.responseText);
            var strAssembly = this.responseText;
            strAssembly = JSON.parse(strAssembly);
            self.activeDesign.activeAssembly = new Assembly(strAssembly);
            if (callback) callback();
          } else {
            console.error("An error occurred!");
          }
        };
        xhr.send();
      }
    },
    saveCustomEntityTypes: {

      /* temporary only */

      value: function saveCustomEntityTypes(typesData) {
        console.log("saving custom entity types", typesData);
      }
    },
    saveFile: {

      //FIXME: move this to asset manager/use it ??

      value: function saveFile(path, data) {
        var fileName = path;
        //only upload if we do not have it
        //TODO do checksum etc
        if (this._designDocs.indexOf(fileName) > -1) {
          return;
        }this._designDocs.push(fileName);

        var uri = "" + this.designsUri + "" + this.designName + "/documents";
        var formData = new FormData();
        var name = "test";
        formData.append(name, data, fileName);

        var xhr = new XMLHttpRequest();
        // Open the connection.
        xhr.open("POST", uri, true);
        xhr.onload = function () {
          if (xhr.status === 200) {
            // File(s) uploaded.
            console.log("uploaded ok");
          } else {
            console.error("An error occurred!");
          }
        };
        xhr.upload.addEventListener("progress", function (e) {
          if (e.lengthComputable) {
            var percentage = Math.round(e.loaded * 100 / e.total);
            console.log("upload in progress", percentage);
          }
        }, false);

        xhr.send(formData);
        /*var reader = new FileReader();  
         this.xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
              var percentage = Math.round((e.loaded * 100) / e.total);
            }
          }, false);
        xhr.open("POST", "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php");
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        reader.onload = function(evt) {
          xhr.sendAsBinary(evt.target.result);
        };
        reader.readAsBinaryString(file);*/
      }
    }
  });

  return TestApi;
})();

exports.TestApi = TestApi;

},{}],10:[function(require,module,exports){
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

var hashCodeFromString = function hashCodeFromString(s) {
	return s.split("").reduce(function (a, b) {
		a = (a << 5) - a + b.charCodeAt(0);return a & a;
	}, 0);
};

var nameCleanup = function nameCleanup(name) {
	var cName = name.substr(0, name.lastIndexOf("."));
	cName = cName.replace("_", "");
	return cName;
};

exports.generateUUID = generateUUID;
exports.hashCodeFromString = hashCodeFromString;
exports.nameCleanup = nameCleanup;

},{}]},{},[8])(8)
});