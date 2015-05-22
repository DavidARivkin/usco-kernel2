
//TODO: taken from three.js ,do correct attribution
export function generateUUID() {

	// http://www.broofa.com/Tools/Math.uuid.htm

	let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
	let uuid = new Array( 36 );
	let rnd = 0, r;

	return function () {

		for ( let i = 0; i < 36; i ++ ) {

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

		return uuid.join( '' )

	}()
}

export function hashCodeFromString(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)           
}

function camelCase (string) {
    return string.replace( /-([a-z])/ig, function( all, letter ) {
        return letter.toUpperCase();
    });
}

function camelCase2 (string) {
    return string.replace( /-([a-z])/ig, function( all, letter ) {
        return letter.toUpperCase();
    });
}

//TODO: do this better
export function nameCleanup( name ){
   let cName = name.substr(0, name.lastIndexOf('.')); 
   //cName = cName.replace(/_/g, '').replace(/-/g, '');
   cName = camelCase(cName);
   cName = camelCase2(cName);
   //cName = cName.replace("_","").replace("-","");
   return cName;
}

/*generate a url-valid string from the input string :ie remove spaces, */
export function normalizeString(string){
  return string.toLowerCase().replace(/\./g, '-').replace(/ /g, '-')
}
