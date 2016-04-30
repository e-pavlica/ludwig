class Item {
    constructor(type) {
        this._type = type;
    }

}

class Title extends Item {
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

}
