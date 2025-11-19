import type { NodeBasicHide } from './NodeBasicHide';
import type { NodeBasicReveal } from './NodeBasicReveal';
import type { NodeBasicUnhide } from './NodeBasicUnhide';
import type { NodeCamera } from './NodeCamera';
import type { NodeMain } from './NodeMain';
import type { NodeToMarkerPosition } from './NodeToMarkerPosition';

export type type_sceneNode = NodeMain | NodeToMarkerPosition | NodeBasicHide | NodeBasicReveal | NodeBasicUnhide | NodeCamera;

