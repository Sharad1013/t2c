import events from "events";

const EventEmitter = events.EventEmitter;
const pickupEmitter = new EventEmitter();

export default pickupEmitter;