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
import { reconcileScene, reconcile_animationState, NodeMain, NodeCamera, Vector3, Euler, SceneObject } from 'hw-ts-parametric-sequencer/3d';
```

### 2D Animations

```typescript
import { reconcileScene2D, reconcile_animationState2D, NodeMain2D, NodeCamera2D, Vector2, SceneObject2D } from 'hw-ts-parametric-sequencer/2d';
```

**Important**: There is no default/root export. You must explicitly import from `/2d` or `/3d`.

## Quick Start

### 3D Example

```typescript
import { reconcileScene, reconcile_animationState, NodeMain, NodeCamera, Vector3, Euler, SceneObject } from 'hw-ts-parametric-sequencer/3d';

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
    time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'object1-position' } },
    duration: 1.5,
    rotationX: 45,
    rotationY: -30,
    target: new Vector3(0, 0, 0),
    zoom: 1.2
  })
];

// Reconcile the scene (processes nodes, resolves timing dependencies)
const reconciled = reconcileScene(scene);
console.log(`Animation duration: ${reconciled.duration}s`);

// Your own animation loop - get state at any time
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  
  const currentTime = (Date.now() - startTime) / 1000;
  const state = reconcile_animationState(reconciled, currentTime);
  
  // Update your 3D scene with state.models and state.camera
  state.models.forEach((modelState, modelID) => {
    // Apply modelState.position (Vector3), modelState.rotation (Quaternion), modelState.opacity to your model
  });
  // Apply state.camera (rotationX, rotationY, target, zoom) to your camera
}

animate();
```

### 2D Example

```typescript
import { reconcileScene2D, reconcile_animationState2D, NodeMain2D, NodeCamera2D, Vector2, SceneObject2D } from 'hw-ts-parametric-sequencer/2d';

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
    time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'object1-position' } },
    duration: 1.5,
    pan: new Vector2(0, 0),
    zoom: 1.2,
    rotation: 0 // Angle in degrees
  })
];

// Reconcile the scene (processes nodes, resolves timing dependencies)
const reconciled = reconcileScene2D(scene);
console.log(`Animation duration: ${reconciled.duration}s`);

// Your own animation loop - get state at any time
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  
  const currentTime = (Date.now() - startTime) / 1000;
  const state = reconcile_animationState2D(reconciled, currentTime);
  
  // Update your 2D scene with state.models and state.camera
  state.models.forEach((modelState, modelID) => {
    // Apply modelState.position (Vector2), modelState.rotation (number in degrees), 
    // modelState.opacity, modelState.scale to your model
  });
  // Apply state.camera (pan, zoom, rotation) to your camera
}

animate();
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

### From v1.x (Class-based API with playback)

If you were using the class-based API with `Sequencer2D` or `Sequencer3D`:

1. **Replace Sequencer class with functional API**:
   ```typescript
   // Before
   const sequencer = new Sequencer2D({ onUpdate, onComplete, loop });
   sequencer.loadScene(scene);
   sequencer.play();
   const state = sequencer.getAnimationState();
   
   // After
   const reconciled = reconcileScene2D(scene);
   const state = reconcile_animationState2D(reconciled, currentTime);
   ```

2. **Implement your own playback loop**:
   ```typescript
   // You now control timing yourself
   let startTime = Date.now();
   function animate() {
     requestAnimationFrame(animate);
     const time = (Date.now() - startTime) / 1000;
     const state = reconcile_animationState2D(reconciled, time);
     // Update your scene
   }
   ```

3. **Update imports**:
   ```typescript
   // Before
   import { Sequencer2D, ... } from 'hw-ts-parametric-sequencer/2d';
   
   // After
   import { reconcileScene2D, reconcile_animationState2D, ... } from 'hw-ts-parametric-sequencer/2d';
   ```

## Documentation

For comprehensive documentation, see [AGENTS.md](./AGENTS.md).

## API Overview

### Core Functions (2D and 3D)

The library provides functional APIs for both 2D and 3D:

**2D:**
- `reconcileScene2D(scene: SceneDefinition2D)`: Reconciles a scene and returns keyframes + duration
- `reconcile_animationState2D(reconciled, time: number)`: Gets animation state at a specific time
- `reconcileKeyframes2D(scene)`: Core reconciliation function (lower-level)
- `keyframes_getSceneDuration2D(reconciled)`: Gets scene duration

**3D:**
- `reconcileScene(scene: SceneDefinition3D)`: Reconciles a scene and returns keyframes + duration
- `reconcile_animationState(reconciled, time: number)`: Gets animation state at a specific time
- `reconcileKeyframes(scene)`: Core reconciliation function (lower-level)
- `keyframes_getSceneDuration(reconciled)`: Gets scene duration

**Usage Pattern:**
1. Define your scene as an array of nodes
2. Call `reconcileScene()` once to process the scene
3. Call `reconcile_animationState()` with your own timestamps in your animation loop

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

### Contributing to Documentation

This project uses a documentation pipeline that generates API documentation from TSDoc comments:

```
TSDoc comments in TypeScript source
        ↓
TypeDoc (with Markdown plugin)
        ↓
Generated Markdown files (API docs)
        ↓
Astro (Starlight) renders the Markdown
```

#### Documentation Build Commands

- `npm run docs:generate` - Generate TypeDoc API docs from TSDoc comments
- `npm run docs:dev` - Run Astro dev server for local documentation preview
- `npm run docs:build` - Generate TypeDoc + build Astro site
- `npm run docs:preview` - Preview built Astro site locally

#### TSDoc Standards

When adding or modifying public APIs:

1. **All public APIs must have TSDoc comments** using the `/** */` format
2. **Use `@param` for parameters**, `@returns` for return values, `@remarks` for additional notes
3. **Include `@example` blocks** for complex APIs
4. **Document all properties** of interfaces and types
5. **Use `@internal`** for methods that are not part of the public API

#### Workflow for Adding/Modifying Documentation

**For API documentation:**
1. Add or update TSDoc comments in the source TypeScript files
2. Run `npm run docs:generate` to regenerate API docs
3. Verify the docs appear correctly
4. Test locally with `npm run docs:dev`
5. Commit both source code changes and generated API docs

**For guide pages:**
- Edit Markdown files in `docs/src/content/docs/`
- Test locally with `npm run docs:dev`

**Important Notes:**
- Never modify generated Markdown files manually - they are generated by TypeDoc
- Always run `npm run docs:generate` before building the documentation site
- The documentation site is automatically built and deployed on push to `main` branch
