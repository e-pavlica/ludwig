(function() {
    'use strict';
    if (!window.Ludwig) window.Ludwig = {};

    Ludwig.Item = class Item {
        constructor(type) {
            this._type = type;
        }
    };

    Ludwig.Title = class Title extends Ludwig.Item {
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
