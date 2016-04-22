class TessituraDatabase {
    /**
     * Initial Configuration
     */
    constructor() {
        this.DB_NAME = 'tessitura-app';
        this.DB_VERSION = 1;
        this.FILE_STORE_NAME = 'files';
        this.PREFERENCE_STORE_NAME = 'prefs';
        this.ANNOTATION_STORE_NAME = 'annotations';
        this.TITLE_STORE_NAME = 'titles';
        let _this = this;
        let request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

        // Successfully Opened IndexedDB
        request.onsuccess = (e) => {
            _this._db = e.target.result;
            let event = new Event('dbAttached', {
                bubbles: true,
                cancelable: false
            });
            document.dispatchEvent(event);
        };

        // Failed to Open IndexedDB
        request.onerror = (e) => {
            console.warn(`[TessituraDatabase] Error accessing DB: ${e.target.errorCode}`);
        };

        // Set Up the DB
        request.onupgradeneeded = (e) => {
            let db = e.target.result;
            _this._setupDB(db).then(() => {
                _this._db = db;
            });
        };
    }

    /**
     * Get all Tessitura titles from IndexedDB
     * @returns {Promise} resolves with Array of titles
     */
    allTitles() {
        return new Promise((resolve, reject) => {
            let files = [];
            let cursor = this._objectStore(this.TITLE_STORE_NAME).openCursor();

            cursor.onsuccess = (e) => {
                let file = e.target.result;
                if (file) {
                    files.push(file.value);
                    file.continue();
                } else {
                    resolve(files);
                }
            };

            cursor.onerror = (e) => {
                console.warn(`[TessituraDatabase] Failed to get titles: ${e.target.errorCode}`);
                reject(e.target.errorCode);
            };
        });
    }

    /**
     * Delete a record from IndexedDB
     * @param {String} type - type of record
     * @param {String} key - key for record
     * @returns {Promise} - resolves with record
     */
    delete(type, key) {
        let _this = this;
        let store = this[`${type.toUpperCase()}_STORE_NAME`];
        return new Promise(function(resolve, reject) {
            let request = _this._objectStore(store, 'readonly').delete(key);
            request.onsuccess = (e) => {
                console.log(`[TessituraDatabase] Deleted ${type} ${key}`);
                resolve(request.result);
            };

            request.onerror = (e) => {
                console.warn(`[TessituraDatabase] Failed to delete ${type} ${key}`);
                reject(new Error(e.target.errorCode));
            };
        });
    }

    /**
     * Get specific record from IndexedDB
     * @param {String} type - type of record
     * @param {String} key - key for record
     * @returns {Promise} - resolves with record
     */
    retrieve(type, key) {
        let _this = this;
        let store = this[`${type.toUpperCase()}_STORE_NAME`];
        return new Promise(function(resolve, reject) {
            let request = _this._objectStore(store, 'readonly').get(key);
            request.onsuccess = (e) => {
                console.log(`[TessituraDatabase] Updated ${type} ${key}`);
                resolve(request.result);
            };

            request.onerror = (e) => {
                console.warn(`[TessituraDatabase] Failed to update ${type} ${key}`);
                reject(new Error(e.target.errorCode));
            };
        });
    }

    /**
     * Save a record to IndexedDB
     * @param {String} type - type of record
     * @param {Object} record - Object containing record data
     * @returns {Promise} resolves with new record key
     */
    save(type, record) {
        let _this = this;
        let store = this[`${type.toUpperCase()}_STORE_NAME`];

        return new Promise(function(resolve, reject) {
            let request = _this._objectStore(store, 'readwrite').add(record);
            request.onsuccess = (e) => {
                console.log(`[TessituraDatabase] Saved ${type}`);
                resolve(e.target.result);
            };

            request.onerror = (e) => {
                console.warn(`[TessituraDatabase] Failed to save ${type}: ${e}`);
                reject(new Error(e.target.errorCode));
            };
        });
    }

    /**
     * Update a record to IndexedDB
     * @param {String} type - type of record
     * @param {String} key - key of record to be updated
     * @param {Object} record - Object containing record data
     * @returns {Promise} resolves with updated record's key
     */
    update(type, key, record) {
        let _this = this;
        let store = this[`${type.toUpperCase()}_STORE_NAME`];

        return new Promise(function(resolve, reject) {
            let request = _this._objectStore(store, 'readwrite').put(record, key);
            request.onsuccess = (e) => {
                console.log(`[TessituraDatabase] Saved ${type}`);
                resolve(e.target.result);
            };

            request.onerror = (e) => {
                console.warn(`[TessituraDatabase] Failed to save ${type}: ${e}`);
                reject(new Error(e.target.errorCode));
            };
        });
    }

    /**
     * @param {String} storeName - name of IndexedDB ObjectStore
     * @param {String} mode - IndexedDB access mode. Valid: 'readonly' (default), 'readwrite', or 'versionchange'
     * @returns {IDBObjectStore} - object store
     */
    _objectStore(storeName, mode = 'readonly') {
        return this._db.transaction(storeName, mode).objectStore(storeName);
    }

    /**
     * Set up the IndexedDB Database.
     * Database Schema:
     *   tessitura-app:
     *     files  (objectStore) - Objects representing PDF files
     *     titles (objectStore) - Objects representing a sheet music file's meta-data
     *     prefs  (objectStore) - Objects related to the application configuration
     *
     * @param {IDBDatabase} db
     * @returns {Promise}
     */
    _setupDB(db) {
        let completed = {
            files: false,
            titles: false,
            prefs: false
        };

        let done = () => {
            return completed.files || completed.titles || completed.prefs;
        };

        return new Promise((resolve, reject) => {
            let handleEvents = function(objectStore, type) {
                objectStore.onsuccess = () => {
                    console.info(`[TessituraDatabase] Initialized ${type} objectStore`);
                    completed[type] = true;
                    if (done()) { resolve(); }
                };
                objectStore.onerror = (e) => {
                    reject(new Error(e.target.errorCode));
                };
            };

            /**
             * File:
             * {
             *   name: {String} - Original File Name,
             *   importedAt: {Date} - Date the file was added,
             *   data: {Uint8Array} - File Data from File.readAsArrayBuffer
             * }
             */
            let fileStore = db.createObjectStore( this.FILE_STORE_NAME, { autoIncrement: true });
            handleEvents(fileStore, 'files');

            /**
             * Title:
             * {
             *   title: {String} - Title Name,
             *   composer: {String} - Title Composer,
             *   arranger: {String} - Title Arranger,
             *   key: {String} - Title Key,
             *   notes: {String} - Notes about title,
             *   annotations: {Array} - Annotations to be displayed,
             *   fileID: {Number} - ID of PDF File
             * }
             */
            let titleStore = db.createObjectStore( this.TITLE_STORE_NAME, { autoIncrement: true });
            titleStore.createIndex('title', 'title', { unique: false });
            titleStore.createIndex('fileID', 'fileID', { unique: true });
            handleEvents(titleStore, 'titles');

            /**
             * Preference:
             * {
             *   pref: {String} - Name of Preference / Setting,
             *   settings: {Object} - Preference configuration
             * }
             */
            let prefStore = db.createObjectStore( this.PREFERENCE_STORE_NAME, { keyPath: 'pref' });
            handleEvents(prefStore, 'prefs');
        });
    }
}
