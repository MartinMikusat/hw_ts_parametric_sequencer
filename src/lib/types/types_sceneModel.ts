import type { Vector3, Euler } from '../math';

/**
 * Interface for model definition
 */
export type type_modelDefinition = {
	name: string;
	modelPath?: string;
};

/**
 * Interface for marker definition.
 * All rotations in the public API are expressed in DEGREES.
 */
export type type_sceneModel_marker = {
	position: Vector3;
	rotation: Euler;
};

export type type_sceneModel_marker_withParent = type_sceneModel_marker & {
	parent: SceneModel;
};

/**
 * A class that encapsulates both scene model and marker functionality
 */
export class SceneModel {
	/** The scene model data */
	model: any;
	/** Unique identifier for this model */
	sceneModelID: string;
	/** Collection of markers associated with this model */
	markers: Record<string, type_sceneModel_marker>;

	/**
	 * Create a new SceneModelWithMarkers
	 * @param model The 3D model data
	 * @param sceneModelID Unique identifier for this model
	 * @param markers Record of marker IDs to their definitions
	 */
	constructor(model: type_modelDefinition, sceneModelID: string, markers: Record<string, type_sceneModel_marker> = {}) {
		this.model = model;
		this.sceneModelID = sceneModelID;
		this.markers = markers
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
	 * @returns The marker
	 * @throws Error if marker is not found
	 */
	getMarker<T extends keyof typeof this.markers>(markerID: T): type_sceneModel_marker_withParent {
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
