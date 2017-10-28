/**
 * Gestion d'une liste de fonctions devant réagir à des événements.
 * @class
 */
var Event = function() {
    this._list = [];
};

/**
 * Ajouter un __listener__ à la liste.
 * @param listener{function} Fonction à appeler quand l'énément est déclenché.
 * @return false  si le __listener__  n'a pas été ajouté  (parce qu'il
 * existe déjà ou parce qu'il n'est pas une fonction).
 */
Event.prototype.add = function(listener) {
    if (typeof listener !== 'function') return false;
    this.remove(listener);
    for (var i = 0 ; i < this._list.length ; i++) {
        if( listener === this._list ) return false;
    }
    this._list.push( listener );
    return true;
};

/**
 * Supprimer le __listener__ de la liste.
 * @param listener{function} Fonction à appeler quand l'événement est déclenché.
 * @return false si le __listener__  n'existe pas.
 */
Event.prototype.remove = function(listener) {
    if (typeof listener !== 'function') return false;
    for (var i = 0 ; i < this._list.length ; i++) {
        var x = this._list;
        if( listener === x ) {
            this._list.splice(i, 1);            
            return true;
        }
    }
    return false;
};

/**
 * Supprimer tous les __event__ de la liste.
 */
Event.prototype.clear = function() {
    this._list = [];
};

/**
 * Emettre l'événement. Si un listener retourne ```false```, on n'appelle pas les event suivants.
 */
Event.prototype.fire = function() {
    var i, listener,
        args = [].slice.call( arguments );
    for (i = 0 ; i < this._list.length ; i++) {
        listener = this._list[i];
        if (false === listener.apply(listener, args)) return false;
    }    
    return true;
};


module.exports = Event;
