(function() {
    'use strict';
    if (!window.Tessitura) window.Tessitura = {};

    Tessitura.Item = class Item {
        constructor(type) {
            this._type = type;
        }
    };

    Tessitura.Title = class Title extends Tessitura.Item {
        constructor(name, composer, arranger, key, notes, fileID) {
            super('title');
            this.name = name;
            this.composer = composer;
            this.arranger = arranger;
            this.key = key;
            this.notes = notes;
            this.annotations = [];
            this.fileID = fileID;
        }
    };
})();
