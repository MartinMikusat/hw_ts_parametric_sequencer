import type { Vector2 } from '../math/Vector2';

/**
 * Interface for 2D model definition
 */
export type type_modelDefinition2D = {
	name: string;
	modelPath?: string;
};

/**
 * Interface for 2D marker definition.
 * All rotations in the public API are expressed in DEGREES.
 */
export type type_sceneModel_marker2D = {
	position: Vector2;
	rotation: number; // Angle in degrees
};

export type type_sceneModel_marker2D_withParent = type_sceneModel_marker2D & {
	parent: SceneModel2D;
};

/**
 * A class that encapsulates both 2D scene model and marker functionality.
 * Models have absolute positions; markers are used for relative positioning only.
 */
export class SceneModel2D {
	/** The 2D scene model data */
	model: any;
	/** Unique identifier for this model */
	sceneModelID: string;
	/** Collection of markers associated with this model */
	markers: Record<string, type_sceneModel_marker2D>;

	/**
	 * Create a new SceneModel2D
	 * @param model The 2D model data
	 * @param sceneModelID Unique identifier for this model
	 * @param markers Record of marker IDs to their definitions
	 */
	constructor(model: type_modelDefinition2D, sceneModelID: string, markers: Record<string, type_sceneModel_marker2D> = {}) {
		this.model = model;
		this.sceneModelID = sceneModelID;
		this.markers = markers;
	}

	/**
	 * Get all marker IDs available for this model
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
	getMarker<T extends keyof typeof this.markers>(markerID: T): type_sceneModel_marker2D_withParent {
		const marker = this.markers[markerID as string];
		if (!marker) {
			throw new Error(`Marker ${markerID as string} not found for model ${this.sceneModelID}`);
		}
		return {
			...marker,
			parent: this,
		};
	}
}

