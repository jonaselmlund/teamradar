import 'setimmediate';
import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = function (cb) {
      return setTimeout(cb, 0);
    };
  }