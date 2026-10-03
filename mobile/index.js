// Native entry point.
//
// Why this file exists:
// The Android release build resolves its bundler entry from `package.json`'s
// `main` field (expo/scripts/resolveAppEntry -> @expo/config resolveEntryPoint).
// Metro then bundles exactly that file as the root module.
//
// `App.tsx` only does `export default App`. It never calls
// `AppRegistry.registerComponent('main', ...)`, so if it is used as the root
// module React Native throws on startup:
//     Invariant Violation: "main" has not been registered.
//
// So the entry has to be a file that registers the component. Keeping
// `App.tsx` as a pure component module and registering it from here means the
// same entry works for both `expo start` and release Gradle builds.

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the environment for Expo Go as well.
registerRootComponent(App);