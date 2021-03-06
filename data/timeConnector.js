/**
 * Created by Luki on 08.12.16.
 */

import { pubsub } from './subscriptions';

var timerActive = false;
var date = Date.now();

function toggleTimer() {
    timerActive = !timerActive;
    if (timerActive) {
        timerEvent();
    }
}

function timerEvent() {
    date = Date.now();
    pubsub.publish('timeSub', date);
    if (timerActive) {
        setTimeout(timerEvent, 3000);
    }
}

function getTime() {
    return date;
}

function getTimerStatus() {
    return timerActive;
}

export { toggleTimer, getTime, getTimerStatus };