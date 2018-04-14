'use strict';

let log = require('winston');
let format = require('util').format;

let Event = require('./Event');
let Cache = require('./util/Cache');

const URL = "https://api.smash.gg/%s/event/%s?%s";
const CACHE_KEY = 'event::%s::%s::%s';

class EventByNames extends Event{

    /**
     * @override
     *
     * @param tournamentName
     * @param eventName
     * @param expands
     * @param isCached
     * @returns {Promise}
     */
    static get(tournamentName, eventName, expands, isCached){
        return new Promise(function(resolve, reject){
            try {
                let E = new EventByNames(tournamentName, eventName, expands, isCached);

                E.on('ready', function () {
                    return resolve(E);
                });

                E.on('error', function(e){
                    return reject(e);
                });

                let Tournament = require('./Tournament');
                let T = new Tournament(E.tournamentName, {}, false);
                T.on('ready', function() {
                    E.Tournament = T;
                    E.tournamentSlug = T.getSlug();
                    E.url = format(URL, E.tournamentSlug, E.eventName, E.expandsString);

                    E.load()
                        .then(function(){
                            let cacheKey = format(CACHE_KEY, E.tournamentName, E.eventName, E.expandsString);
                            Cache.set(cacheKey, E);
                        })
                        .then(function(){
                            E.emitEventReady();
                        })
                        .catch(function(err){
                            console.error('Error creating Tournament. For more info, implement Event.on(\'error\')');
                            log.error('Event: ' + err);
                            E.emitEventError(err);
                        })
                });

            } catch(e){
                log.error(e);
                return reject(e);
            }
        })
    }

    constructor(tournamentName, eventName, expands, isCached=true){
        super(null, expands, isCached);

        if(!tournamentName)
            throw new Error('Tournament Name cannot be null for EventByNames');
        if(!eventName)
            throw new Error('Event Name cannot be null for EventByNames');

        this.tournamentName = tournamentName;
        this.eventName = eventName;
        this.isCached = isCached;

        if(!this.expands && !this.expandsString) {
            let formatted = this.formatExpands(expands);
            this.expands = formatted.expands;
            this.expandsString = formatted.expandsString;
        }
    }
}

module.exports = EventByNames;