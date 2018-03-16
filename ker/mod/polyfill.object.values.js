if( !Object.values ) {
  window.Object.values = function( obj ) {
    var values = [];
    for( var key in obj ) values.push( obj[key] );
    return values;
  };
}
