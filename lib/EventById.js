'use strict';

let log = require('winston');
let format = require('util').format;

let Event = require('./Event');
let Cache = require('./util/Cache');

const URL = 'https://api.smash.gg/event/%s?%s';
const CACHE_KEY = 'event::%s::%s';

class EventById extends Event{

    /**
     * @override
     *
     * @param id
     * @param expands
     * @param isCached
     * @returns {Promise}
     */
    static get(id, expands, isCached){
        return new Promise(function(resolve, reject){
            try {
                let E = new EventById(id, expands, isCached);

                E.on('ready', function () {
                    return resolve(E);
                });

                E.on('error', function(e){
                    return reject(e);
                });

                E.load()
                    .then(function(){
                        let cacheKey = format(CACHE_KEY, E.id, E.expandsString);
                        Cache.set(cacheKey, E);
                    })
                    .then(function(){
                        E.emitEventReady();
                    })
                    .catch(function(err){
                        console.error('Error creating Event with id. For more info, implement Event.on(\'error\')');
                        log.error('Event: ' + err);
                        E.emitEventError(err);
                    })
            }catch(e){
                log.error(e);
                return reject(e);
            }
        })
    }

    constructor(id, expands, isCached=true) {
        super(null, expands, isCached);

        if (!id)
            throw new Error('EventById must have an Id parameter');

        this.id = id;
        this.isCached = isCached;

        if(!this.expands && !this.expandsString) {
            let formatted = this.formatExpands(expands);
            this.expands = formatted.expands;
            this.expandsString = formatted.expandsString;
        }

        this.url = format(URL, this.id, this.expandsString);
    }

}

module.exports = EventById;