import env from 'react-native-config';

/**
 * Whether this build ships DevModeWeb.bundle, i.e. whether Dev Mode can work here.
 *
 * Dev Mode is a build-level opt-in: set DEV_MODE=true in the env file (see
 * .env.devmode / `yarn android:devmode`). android/app/build.gradle strips the
 * bundle out of every variant that does not set it, so this must stay in sync with
 * that gradle condition -- WebRunnerHandler serves the web runner out of
 * DevModeWeb.bundle once Dev Mode is on, and turning it on in a build without the
 * bundle leaves the runner unable to start.
 *
 * iOS ships the bundle unconditionally (it is a plain Resources entry in the Xcode
 * project) and no scheme sets ENVFILE, so ordinary iOS builds read .env, have no
 * DEV_MODE, and hide the switch here rather than in the packaging step.
 *
 * Kept in its own module so utils/storage can read it without pulling in the whole
 * constants barrel.
 */
export const isDevModeAvailable = env.DEV_MODE === 'true';
