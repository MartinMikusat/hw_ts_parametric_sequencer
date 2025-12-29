import type { Vector3, Euler } from '../math';

/**
 * Interface for marker definition.
 * All rotations in the public API are expressed in DEGREES.
 */
export type type_sceneObject_marker = {
	position: Vector3;
	rotation: Euler;
};

export type type_sceneObject_marker_withParent = type_sceneObject_marker & {
	parent: SceneObject;
};

/**
 * A class that encapsulates scene object and marker functionality.
 * Represents an animatable object in the scene with an identifier and optional markers.
 */
export class SceneObject {
	/** Unique identifier for this object */
	sceneObjectID: string;
	/** Collection of markers associated with this object */
	markers: Record<string, type_sceneObject_marker>;

	/**
	 * Create a new SceneObject
	 * @param sceneObjectID Unique identifier for this object
	 * @param markers Record of marker IDs to their definitions
	 */
	constructor(sceneObjectID: string, markers: Record<string, type_sceneObject_marker> = {}) {
		this.sceneObjectID = sceneObjectID;
		this.markers = markers
	}

	/**
	 * Get all marker IDs available for this object
	 * @returns Array of marker IDs
	 */
	getMarkerIDs(): string[] {
		return Object.keys(this.markers);
	}

	/**
	 * Get a specific marker by ID
	 * @param markerID The marker identifier
	 * @returns The marker
	 * @throws Error if marker is not found
	 */
	getMarker<T extends keyof typeof this.markers>(markerID: T): type_sceneObject_marker_withParent {
		const marker = this.markers[markerID as string];
		if (!marker) {
			throw new Error(`Marker ${markerID as string} not found for object ${this.sceneObjectID}`);
		}
		return {
			...marker,
			parent: this,
		};
	}
}
