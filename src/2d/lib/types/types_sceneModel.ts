import type { Vector2 } from '../math/Vector2';

/**
 * Interface for 2D marker definition.
 * All rotations in the public API are expressed in DEGREES.
 */
export type type_sceneObject_marker2D = {
	position: Vector2;
	rotation: number; // Angle in degrees
};

export type type_sceneObject_marker2D_withParent = type_sceneObject_marker2D & {
	parent: SceneObject2D;
};

/**
 * A class that encapsulates 2D scene object and marker functionality.
 * Objects have absolute positions; markers are used for relative positioning only.
 */
export class SceneObject2D {
	/** Unique identifier for this object */
	sceneObjectID: string;
	/** Collection of markers associated with this object */
	markers: Record<string, type_sceneObject_marker2D>;

	/**
	 * Create a new SceneObject2D
	 * @param sceneObjectID Unique identifier for this object
	 * @param markers Record of marker IDs to their definitions
	 */
	constructor(sceneObjectID: string, markers: Record<string, type_sceneObject_marker2D> = {}) {
		this.sceneObjectID = sceneObjectID;
		this.markers = markers;
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
	 * @returns The marker with parent reference
	 * @throws Error if marker is not found
	 */
	getMarker<T extends keyof typeof this.markers>(markerID: T): type_sceneObject_marker2D_withParent {
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

