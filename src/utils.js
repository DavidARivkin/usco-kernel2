
//TODO: taken from three.js ,do correct attribution
var generateUUID = function () {

	// http://www.broofa.com/Tools/Math.uuid.htm

	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
	var uuid = new Array( 36 );
	var rnd = 0, r;

	return function () {

		for ( var i = 0; i < 36; i ++ ) {

			if ( i == 8 || i == 13 || i == 18 || i == 23 ) {

				uuid[ i ] = '-';

			} else if ( i == 14 ) {

				uuid[ i ] = '4';

			} else {

				if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[ i ] = chars[ ( i == 19 ) ? ( r & 0x3 ) | 0x8 : r ];

			}
		}

		return uuid.join( '' );

	};

}()

var hashCodeFromString = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

var nameCleanup = function( name ){
   let cName = name.substr(0, name.lastIndexOf('.')); 
   cName = cName.replace("_","");
   return cName;
}

export { generateUUID, hashCodeFromString, nameCleanup };
