# hw-ts-parametric-sequencer

A framework-agnostic TypeScript library for creating parametric animation sequences, particularly designed for 3D scene animations.

## Features

- 🎬 **Parametric Animations**: Define animations with relative timing dependencies
- 🎯 **3D Model Animation**: Animate position, rotation (absolute/relative/worldSpace), and opacity
- 📹 **Camera Control**: Animate camera rotation, zoom, and target position
- 🔗 **Hierarchical Positioning**: Attach models to markers on parent models
- ✨ **Smooth Interpolation**: Linear interpolation for positions, SLERP for rotations
- ⏱️ **Time Reconciliation**: Resolves complex relative timing dependencies
- 🚀 **Framework Agnostic**: Pure TypeScript with no framework dependencies

## Installation

```bash
npm install hw-ts-parametric-sequencer
```

## Quick Start

```typescript
import { Sequencer, NodeMain, NodeCamera, Vector3, Euler } from 'hw-ts-parametric-sequencer';

// Create a scene model
const model1 = new SceneModel(
  { name: 'MyModel' },
  'model1',
  {} // markers
);

// Define animation scene
const scene = [
  new NodeMain({
    name: 'model1-position',
    chapter: 'intro',
    sceneModel: model1,
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
const sequencer = new Sequencer({
  onUpdate: (snapshot) => {
    // Update your 3D scene with snapshot.models and snapshot.camera
    snapshot.models.forEach((state, modelID) => {
      // Apply state.position, state.rotation, state.opacity to your model
    });
    // Apply snapshot.camera to your camera
  },
  onComplete: () => {
    console.log('Animation complete!');
  },
  loop: false
});

sequencer.loadScene(scene);
sequencer.play();
```

## Documentation

For comprehensive documentation, see [AGENTS.md](./AGENTS.md).

## API Overview

### Sequencer

Main class for managing animation playback.

- `loadScene(scene: SceneDefinition)`: Loads and reconciles a scene definition
- `play()`: Starts animation playback
- `pause()`: Pauses animation
- `stop()`: Stops and resets animation
- `setTime(time: number)`: Seeks to a specific time
- `getAnimationState()`: Gets current animation state snapshot

### Node Types

- `NodeMain`: Basic model animation (position, rotation, opacity)
- `NodeCamera`: Camera animation (rotation, zoom, target)
- `NodeBasicReveal`: Reveals a model with fade-in and position animation
- `NodeBasicHide`: Hides a model with fade-out
- `NodeBasicUnhide`: Unhides a model
- `NodeToMarkerPosition`: Positions a model relative to a marker on another model

### Math Utilities

- `Vector3`: 3D vector operations
- `Quaternion`: Rotation representation with SLERP interpolation
- `Euler`: Euler angle representation (all rotation orders supported)

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

