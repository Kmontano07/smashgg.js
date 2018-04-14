'use strict';

let _ = require('lodash');
let moment = require('moment');

let Event = require('../lib/Event');
let EventById = require('../lib/EventById');
let EventByNames = require('../lib/EventByNames');

let Phase = require('../lib/Phase');
let PhaseGroup = require('../lib/PhaseGroup');
let Cache = require('../lib/util/Cache').getInstance();

let chai = require('chai');
let cap = require('chai-as-promised');
chai.use(cap);

let expect = chai.expect;
let assert = chai.assert;

let event1 = {};
let event2 = {};
let event3 = {};
let event4 = {};
let event5 = {};

const TOURNAMENT_NAME1 = 'function1';
const TOURNAMENT_NAME2 = 'ceo2016';
const TOURNAMENT_NAME3 = 'to12';
const EVENT_NAME1 = 'melee-singles';
const BAD_TOURNAMENT_NAME = 'badnamedotexe';

const URL1 = 'api.smash.gg/tournament/function-1-recursion-regional/event/melee-singles';
const URL2 = 'api.smash.gg/tournament/ceo-2016/event/melee-singles?expand[]=phase&expand[]=groups&';

const EVENT_ID_1 = 14335;

let expected = _.extend(

);

function loadEvent(url){
    return new Promise(function(resolve, reject){
        let event = new Event(url);
        event.on('ready', function(){
            resolve(event);
        })
    })
}

function loadEventViaId(id){
    return new Promise(function(resolve, reject){
        let event = new EventById(id);
        event.on('ready', function(){
            resolve(event);
        });
        event.on('error', function(err){
            console.error(err);
        })
    })
}

function loadEventViaNames(tournamentName, eventName){
    return new Promise(function(resolve, reject){
        let event = new EventByNames(tournamentName, eventName);
        event.on('ready', function(){
            resolve(event);
        })
    })
}

describe('Smash GG Event', function(){

    before(function(){
        Cache.flush();
    });

    it('should correctly load the data', async function(){
        this.timeout(15000);

        event1 = await EventByNames.get(TOURNAMENT_NAME1, EVENT_NAME1); //function 1, melee singles
        event2 = await EventByNames.get(TOURNAMENT_NAME2, EVENT_NAME1); // ceo2016, melee singles
        event3 = await EventById.get(EVENT_ID_1);
        event4 = await Event.get(URL1); //function 1, melee singles
        event5 = await Event.get(URL2); //ceo2016, melee singles

        expect(event4.raw).to.be.equal(event1.raw);
        expect(event5.raw).to.be.equal(event2.raw);

        return true;
    });

    it('should correctly get the event name', function(done){
        let name1 = event1.getName();
        let name3 = event3.getName();
        expect(name1).to.be.equal('Melee Singles');
        expect(name3).to.be.equal('Rocket League 3v3');
        done();
    });

    it('should correctly get the event slug', function(done){
        let slug = event1.getSlug();
        expect(slug).to.be.equal('tournament/function-1-recursion-regional/event/melee-singles');
        done();
    });

    it('should correctly get the event start time', function(done){
        let startTime1 = event1.getStartTime();
        let expected = moment('04-01-2017 11:00:00').toDate();
        expect(startTime1.getTime()).to.be.equal(expected.getTime());
        done();
    });

    it('should correctly get the event start time string', function(done){
        let startTime1 = event1.getStartTimeString();

        try {
            expect(startTime1).to.be.equal('04-01-2017 11:00:00 EST');
        }
        catch(e){
            expect(startTime1).to.be.equal('04-01-2017 11:00:00 EDT');
        }
        done();
    });

    it('should correctly get the event end time', function(done){
        let endTime1 = event1.getEndTime();
        let expected = moment('04-01-2017 12:00:00').toDate();
        expect(endTime1.getTime()).to.be.equal(expected.getTime());
        done();
    });

    it('should correctly get the event end time string', function(done){
        let endTime1 = event1.getEndTimeString();

        try {
            expect(endTime1).to.be.equal('04-01-2017 12:00:00 EST');
        }
        catch(e){
            expect(endTime1).to.be.equal('04-01-2017 12:00:00 EDT');
        }
        done();
    });

    it('should correctly get the phases', async function(){
        this.timeout(15000);

        let phases1 = await event1.getEventPhases();
        let phases2 = await event2.getEventPhases();

        expect(phases1.length).to.be.equal(4);
        expect(phases2.length).to.be.equal(2);

        var hasDuplicates = function(a) {
            return _.uniq(a).length !== a.length;
        };
        expect(hasDuplicates(phases1)).to.be.false;
        expect(hasDuplicates(phases2)).to.be.false;

        phases1.forEach(phase => {
            expect(phase).to.be.instanceof(Phase);
        });

        phases2.forEach(phase => {
            expect(phase).to.be.instanceof(Phase);
        });

        return true;
    });

    it('should correctly get the phase groups', async function(){
        this.timeout(40000);

        let groups1 = await event1.getEventPhaseGroups();
        let groups2 = await event2.getEventPhaseGroups();

        expect(groups1.length).to.be.equal(22);
        expect(groups2.length).to.be.equal(33);

        var hasDuplicates = function(a) {
            return _.uniq(a).length !== a.length;
        };
        expect(hasDuplicates(groups1)).to.be.false;
        expect(hasDuplicates(groups2)).to.be.false;

        groups1.forEach(group => {
            expect(group).to.be.instanceof(PhaseGroup);
        });
        groups2.forEach(group => {
            expect(group).to.be.instanceof(PhaseGroup);
        });

        return true;
    })
});