# Example Nodes

This folder contains reusable example node implementations that demonstrate how to build custom animation nodes for the parametric sequencer library.

## Overview

The Basic nodes (`NodeBasicHide`, `NodeBasicReveal`, `NodeBasicUnhide`) are **not** core library functionality. They are example implementations that show common animation patterns:

- **Hide**: Fade out an object with optional position/rotation offset
- **Reveal**: Fade in an object from a starting position/rotation
- **Unhide**: Make a hidden object visible again

These nodes serve as templates for building your own custom nodes that fit your specific animation needs.

## Usage

### Importing Example Nodes

```typescript
// 3D examples
import { NodeBasicHide, NodeBasicReveal, NodeBasicUnhide } from 'hw-ts-parametric-sequencer/examples/3d';

// 2D examples
import { NodeBasicHide2D, NodeBasicReveal2D, NodeBasicUnhide2D } from 'hw-ts-parametric-sequencer/examples/2d';

// Or import all examples
import * as Examples3D from 'hw-ts-parametric-sequencer/examples/3d';
import * as Examples2D from 'hw-ts-parametric-sequencer/examples/2d';
```

### Using Example Nodes with Type Assertions

Since these nodes are not part of the core type unions, you'll need to use type assertions when passing them to `reconcileScene()`:

```typescript
import { reconcileScene, type SceneDefinition3D } from 'hw-ts-parametric-sequencer/3d';
import { NodeBasicReveal } from 'hw-ts-parametric-sequencer/examples/3d';

const scene: SceneDefinition3D = [
  new NodeBasicReveal({
    name: 'reveal-object1',
    chapter: 'intro',
    sceneObject: myObject,
    time: { type: 'absolute', value: 0 },
    duration: 1.5,
    startingPosition: new Vector3(-10, 0, 0),
    startingRotation: new Euler(0, 0, 0)
  })
] as SceneDefinition3D; // Type assertion needed

const reconciled = reconcileScene(scene);
```

### Extending Type Unions (Recommended)

For a cleaner approach, you can extend the type unions to include example nodes:

```typescript
import type { type_reconciliation_node } from 'hw-ts-parametric-sequencer/3d';
import { NodeBasicReveal } from 'hw-ts-parametric-sequencer/examples/3d';

// Extend the type union
type ExtendedNode = type_reconciliation_node | NodeBasicReveal | NodeBasicHide | NodeBasicUnhide;

// Now you can use ExtendedNode without type assertions
const nodes: ExtendedNode[] = [
  new NodeBasicReveal({ /* ... */ })
];
```

## Building Custom Nodes

These example nodes demonstrate the pattern for creating custom nodes:

1. **Implement the `reconcile()` method**: Returns an array of keyframes
2. **Implement the `getRelativeID()` method**: Returns an ID for relative timing references
3. **Follow the node interface**: Ensure your node has `name`, `chapter`, `time`, `duration`, and `sceneObject` properties

### Example: Custom Fade Node

```typescript
import type { SceneObject } from 'hw-ts-parametric-sequencer/3d';
import type { type_keyframe_model, type_time } from 'hw-ts-parametric-sequencer/3d';

export class NodeCustomFade {
  name: string;
  chapter: string;
  sceneObject: SceneObject;
  duration: number;
  time: type_time;
  targetOpacity: number;

  constructor(props: {
    name: string;
    chapter: string;
    sceneObject: SceneObject;
    duration: number;
    time: type_time;
    targetOpacity: number;
  }) {
    this.name = props.name;
    this.chapter = props.chapter;
    this.sceneObject = props.sceneObject;
    this.duration = props.duration;
    this.time = props.time;
    this.targetOpacity = props.targetOpacity;
  }

  getRelativeID(): string {
    return `${this.name}-fade`;
  }

  reconcile(): Array<type_keyframe_model> {
    return [
      {
        id: this.getRelativeID(),
        sceneObject: this.sceneObject,
        time: this.time,
        opacity: this.targetOpacity,
        duration: this.duration,
        chapter: this.chapter,
      },
    ];
  }
}
```

## Why Examples Instead of Core?

The library is designed to be flexible and framework-agnostic. By keeping these nodes as examples rather than core functionality:

- **Flexibility**: You can build nodes that match your exact animation needs
- **Simplicity**: The core library focuses on the reconciliation engine, not specific animation patterns
- **Learning**: These examples show you how the system works and how to extend it

## Contributing

If you've built a useful reusable node that others might benefit from, consider:
1. Adding it to your own examples folder
2. Sharing it with the community
3. Documenting it as a pattern others can follow

