import idb from 'idb';



     let dbPromise = idb.open('test_db',1,function(upgradeDB){
        var keyValStore = upgradeDB.createObjectStore('keyval');
        keyValStore.put('world','hello');
    });
    
    dbPromise.then(function(db){
        var tx = db.transaction('keyval');
        var keyValStore = tx.objectStore('keyval');
        return keyValStore.get('hello');
    }).then(function(val){
        console.log('the value of x ',val);
    })
    
    dbPromise.then(function(db){
        var tx = db.transaction('keyval','readwrite');
        var keyvalStore = tx.objectStore('keybal');
        keyvalStore.put('bar','foo');
        return tx.complete;
    }).then(function(){
        console.log('added stuff to keyval');
    })
    
    exports.module={dbPromise}