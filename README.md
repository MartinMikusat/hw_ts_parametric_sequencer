# hw-ts-parametric-sequencer

A framework-agnostic TypeScript library for creating parametric animation sequences, with separate implementations for 2D and 3D scene animations.

## Features

- 🎬 **Parametric Animations**: Define animations with relative timing dependencies
- 🎯 **2D & 3D Support**: Separate implementations optimized for each dimension
- 📹 **Camera Control**: Animate camera properties (2D: pan/zoom/rotation, 3D: rotation/zoom/target)
- 🔗 **Relative Positioning**: Use markers for relative positioning (2D: simple offsets, 3D: hierarchical transforms)
- ✨ **Smooth Interpolation**: Linear interpolation for positions, SLERP for 3D rotations, shortest-arc for 2D angles
- ⏱️ **Time Reconciliation**: Resolves complex relative timing dependencies
- 🚀 **Framework Agnostic**: Pure TypeScript with no framework dependencies
- 🌳 **Tree-Shakeable**: Import only what you need - 2D and 3D codebases are completely separate

## Installation

```bash
npm install hw-ts-parametric-sequencer
```

## Importing

The library provides separate entry points for 2D and 3D functionality:

### 3D Animations

```typescript
import { Sequencer3D, NodeMain, NodeCamera, Vector3, Euler, SceneObject } from 'hw-ts-parametric-sequencer/3d';
```

### 2D Animations

```typescript
import { Sequencer2D, NodeMain2D, NodeCamera2D, Vector2, SceneObject2D } from 'hw-ts-parametric-sequencer/2d';
```

**Important**: There is no default/root export. You must explicitly import from `/2d` or `/3d`.

## Quick Start

### 3D Example

```typescript
import { Sequencer3D, NodeMain, NodeCamera, Vector3, Euler, SceneObject } from 'hw-ts-parametric-sequencer/3d';

// Create a scene object
const object1 = new SceneObject(
  'object1',
  {} // markers
);

// Define animation scene
const scene = [
  new NodeMain({
    name: 'object1-position',
    chapter: 'intro',
    sceneObject: object1,
    time: { type: 'absolute', value: 0 },
    duration: 2,
    position: { type: 'absolute', value: new Vector3(1, 0, 0) },
    rotation: { type: 'relative', value: new Euler(0, 90, 0) },
    opacity: 1.0
  }),
  new NodeCamera({
    name: 'camera1',
    chapter: 'intro',
    time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'model1-position' } },
    duration: 1.5,
    rotationX: 45,
    rotationY: -30,
    target: new Vector3(0, 0, 0),
    zoom: 1.2
  })
];

// Create sequencer and play
const sequencer = new Sequencer3D({
  onUpdate: (snapshot) => {
    // Update your 3D scene with snapshot.models and snapshot.camera
    snapshot.models.forEach((state, modelID) => {
      // Apply state.position (Vector3), state.rotation (Quaternion), state.opacity to your model
    });
    // Apply snapshot.camera (rotationX, rotationY, target, zoom) to your camera
  },
  onComplete: () => {
    console.log('Animation complete!');
  },
  loop: false
});

sequencer.loadScene(scene);
sequencer.play();
```

### 2D Example

```typescript
import { Sequencer2D, NodeMain2D, NodeCamera2D, Vector2, SceneObject2D } from 'hw-ts-parametric-sequencer/2d';

// Create a 2D scene object
const object1 = new SceneObject2D(
  'object1',
  {} // markers
);

// Define animation scene
const scene = [
  new NodeMain2D({
    name: 'object1-position',
    chapter: 'intro',
    sceneObject: object1,
    time: { type: 'absolute', value: 0 },
    duration: 2,
    position: { type: 'absolute', value: new Vector2(100, 50) },
    rotation: { type: 'relative', value: 90 }, // Angle in degrees
    opacity: 1.0,
    scale: 1.0
  }),
  new NodeCamera2D({
    name: 'camera1',
    chapter: 'intro',
    time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'model1-position' } },
    duration: 1.5,
    pan: new Vector2(0, 0),
    zoom: 1.2,
    rotation: 0 // Angle in degrees
  })
];

// Create sequencer and play
const sequencer = new Sequencer2D({
  onUpdate: (snapshot) => {
    // Update your 2D scene with snapshot.models and snapshot.camera
    snapshot.models.forEach((state, modelID) => {
      // Apply state.position (Vector2), state.rotation (number in degrees), 
      // state.opacity, state.scale to your model
    });
    // Apply snapshot.camera (pan, zoom, rotation) to your camera
  },
  onComplete: () => {
    console.log('Animation complete!');
  },
  loop: false
});

sequencer.loadScene(scene);
sequencer.play();
```

## Key Differences: 2D vs 3D

### 2D Implementation

- **Math**: `Vector2` for positions, `number` for angles (degrees)
- **Camera**: `pan` (Vector2), `zoom` (number), `rotation` (number in degrees)
- **Models**: `position` (Vector2), `rotation` (number in degrees), `opacity`, `scale`
- **Markers**: Simple relative positioning - marker position/rotation added to parent (no hierarchical transforms)
- **Rotation Interpolation**: Shortest-arc interpolation for angles

### 3D Implementation

- **Math**: `Vector3`, `Quaternion`, `Euler` for 3D transformations
- **Camera**: `rotationX`, `rotationY`, `target` (Vector3), `zoom`
- **Models**: `position` (Vector3), `rotation` (Quaternion), `opacity`
- **Markers**: Hierarchical positioning - marker transforms applied in parent's coordinate space
- **Rotation Interpolation**: SLERP (spherical linear interpolation) for quaternions

## Migration from Previous Versions

If you were using the library before the 2D/3D split:

1. **Update imports**: Change from default import to explicit `/3d` import:
   ```typescript
   // Before
   import { Sequencer, ... } from 'hw-ts-parametric-sequencer';
   
   // After
   import { Sequencer3D, ... } from 'hw-ts-parametric-sequencer/3d';
   ```

2. **Rename Sequencer**: `Sequencer` → `Sequencer3D`

3. **Update type names**: 
   - `SceneDefinition` → `SceneDefinition3D`
   - `SequencerOptions` → `SequencerOptions3D`
   - `AnimationSnapshot` → `AnimationSnapshot3D`

4. **No other changes needed**: The API and behavior remain identical for 3D functionality.

## Documentation

For comprehensive documentation, see [AGENTS.md](./AGENTS.md).

## API Overview

### Sequencer (2D and 3D)

Both `Sequencer2D` and `Sequencer3D` have identical lifecycle APIs:

- `loadScene(scene: SceneDefinition)`: Loads and reconciles a scene definition
- `play()`: Starts animation playback
- `pause()`: Pauses animation
- `stop()`: Stops and resets animation
- `setTime(time: number)`: Seeks to a specific time
- `getAnimationState()`: Gets current animation state snapshot

### Node Types

#### 3D Nodes (`hw-ts-parametric-sequencer/3d`)
- `NodeMain`: Basic model animation (position, rotation, opacity)
- `NodeCamera`: Camera animation (rotationX, rotationY, target, zoom)
- `NodeBasicReveal`: Reveals a model with fade-in and position animation
- `NodeBasicHide`: Hides a model with fade-out
- `NodeBasicUnhide`: Unhides a model
- `NodeToMarkerPosition`: Positions an object relative to a marker on another object (hierarchical)

#### 2D Nodes (`hw-ts-parametric-sequencer/2d`)
- `NodeMain2D`: Basic model animation (position2D, angle, opacity, scale)
- `NodeCamera2D`: Camera animation (pan, zoom, rotation)
- `NodeBasicReveal2D`: Reveals a model with fade-in and position animation
- `NodeBasicHide2D`: Hides a model with fade-out
- `NodeBasicUnhide2D`: Unhides a model
- `NodeToMarkerPosition2D`: Positions an object relative to a marker (simple offset)

### Math Utilities

#### 3D (`hw-ts-parametric-sequencer/3d`)
- `Vector3`: 3D vector operations
- `Quaternion`: Rotation representation with SLERP interpolation
- `Euler`: Euler angle representation (all rotation orders supported)

#### 2D (`hw-ts-parametric-sequencer/2d`)
- `Vector2`: 2D vector operations
- Angle helpers: `shortestArcInterpolation`, `normalizeAngleDegrees`, `deg2rad`, `rad2deg`

## Tree-Shaking

The library is designed for optimal tree-shaking:

- Importing only from `/2d` will exclude all 3D code from your bundle
- Importing only from `/3d` will exclude all 2D code from your bundle
- No shared code between 2D and 3D implementations ensures complete separation

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
