import { library } from '@fortawesome/fontawesome-svg-core';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';

/**
 * There are two options to refer to an SVG icon: explicit import and library build-up.
 * Using library build-up allows us to refer to an icon by its shorter name version, i.e. 'stop' for 'faStop'.
 * It should also bring less boilerplate code and less work for tree-shaking.
 *
 * For more details see: https://fontawesome.com/docs/web/use-with/react-native#_2-build-a-library
 */
export function preloadIconsLibraryRegistry() {
    library.add(faStop, faPlay, faRotateRight);
}
