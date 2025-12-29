# AGENTS.md - Parametric Sequencer Library

## Project Overview

**hw-ts-parametric-sequencer** is a framework-agnostic TypeScript library for creating parametric animation sequences, particularly designed for 3D scene animations. The library provides a declarative API for defining complex animation timelines with support for relative timing, hierarchical model positioning, camera control, and smooth interpolation.

### Purpose

This library enables developers to:
- Define animation sequences declaratively using node-based scene definitions
- Create complex timing relationships between animations (absolute, relative, multiple dependencies)
- Animate 3D models with position, rotation, and opacity changes
- Control camera movements with rotation, zoom, and target positioning
- Support hierarchical model positioning using markers
- Generate interpolated animation states at any point in time

### Key Features

- **Parametric Animations**: Define animations with relative timing dependencies
- **3D Model Animation**: Animate position, rotation (absolute/relative/worldSpace), and opacity
- **Camera Control**: Animate camera rotation, zoom, and target position
- **Hierarchical Positioning**: Attach models to markers on parent models
- **Smooth Interpolation**: Linear interpolation for positions, SLERP for rotations
- **Time Reconciliation**: Resolves complex relative timing dependencies
- **Framework Agnostic**: Pure TypeScript with no framework dependencies

---

## Architecture

### High-Level Flow

```
Scene Definition (Nodes)
    ↓
Node Reconciliation (nodes_reconcile)
    ↓
Keyframe Generation
    ↓
Time Reconciliation (reconcileKeyframesTime)
    ↓
Time Extension (extendTimeOfKeyframes)
    ↓
Sorting (sortKeyframesForMarkerPositions)
    ↓
Animation State Reconciliation (reconcile_animationState)
    ↓
Animation Snapshot (models + camera state)
```

### Core Components

#### 1. **Reconciliation Functions** (`src/lib/reconciliation/`)
The main public API for the library. Provides functional APIs for reconciling scenes and calculating animation states at any point in time.

**Key Functions:**
- `reconcileScene(scene: SceneDefinition)`: Reconciles a scene and returns keyframes + duration (convenience function)
- `reconcileKeyframes(scene: SceneDefinition)`: Core reconciliation function (lower-level)
- `reconcile_animationState(reconciled, time: number)`: Gets animation state at a specific time
- `keyframes_getSceneDuration(reconciled)`: Gets scene duration

**Usage Pattern:**
```typescript
// 1. Define scene
const scene: SceneDefinition3D = [/* nodes */];

// 2. Reconcile once
const reconciled = reconcileScene(scene);

// 3. Get state at any time (user controls timing)
const state = reconcile_animationState(reconciled, currentTime);
```

**Note:** The library does not provide playback functionality. Users implement their own animation loops and call `reconcile_animationState()` with their own timestamps.

#### 2. **Node System** (`src/lib/reconciliation/nodes/`)
Nodes represent declarative animation instructions. Each node type generates keyframes when reconciled.

**Node Types:**
- `NodeMain`: Basic model animation (position, rotation, opacity)
- `NodeCamera`: Camera animation (rotation, zoom, target)
- `NodeBasicReveal`: Reveals a model with fade-in and position animation
- `NodeBasicHide`: Hides a model with fade-out
- `NodeBasicUnhide`: Unhides a model
- `NodeToMarkerPosition`: Positions a model relative to a marker on another model

**Common Pattern:**
All nodes implement:
- `reconcile()`: Returns array of keyframes
- `getRelativeID()`: Returns ID for relative time references

#### 3. **Keyframe Types** (`src/lib/reconciliation/keyframes/types.ts`)

**Model Keyframes** (`type_keyframe_model`):
- `id`: Unique identifier
- `sceneObject`: Reference to the SceneObject being animated
- `time`: Timing specification (absolute, relative, or multiple dependencies)
- `duration`: Duration of this keyframe
- `position`: Optional position change (absolute, relative, or marker-based)
- `rotation`: Optional rotation change (absolute, relative, or worldSpace)
- `opacity`: Optional opacity value (0-1)
- `chapter`: Optional chapter identifier

**Camera Keyframes** (`type_keyframe_camera`):
- `id`: Unique identifier
- `time`: Timing specification
- `duration`: Duration of this keyframe
- `rotationX`, `rotationY`: Camera rotation angles (degrees)
- `target`: Camera target position (Vector3)
- `zoom`: Camera zoom level
- `chapter`: Chapter identifier

**Time Types:**
- `absolute`: Fixed time value
- `relative`: Relative to another keyframe's start/end time
- `multiple`: Relative to multiple keyframes (uses latest)

#### 4. **Reconciliation Pipeline**

**Step 1: Node Reconciliation** (`nodes_reconcile`)
- Converts scene nodes into keyframes
- Separates model and camera keyframes
- Collects SceneObject references

**Step 2: Time Reconciliation** (`reconcileKeyframesTime`)
- Resolves relative time dependencies
- Converts all times to absolute values
- Handles dependency resolution with topological sorting
- Throws errors for circular dependencies or unresolved references

**Step 3: Time Extension** (`extendTimeOfKeyframes`)
- Extends keyframe durations to fill gaps
- Ensures continuous animation coverage

**Step 4: Sorting** (`sortKeyframesForMarkerPositions`)
- Sorts keyframes to ensure parent models are processed before children
- Critical for marker-based positioning

**Step 5: Animation State Reconciliation** (`reconcile_animationState`)
- Calculates interpolated state at a given time
- Processes all active keyframes
- Handles marker-based positioning with parent transforms
- Returns `AnimationSnapshot` with model states and camera state

#### 5. **Math Utilities** (`src/lib/math/`)

**Vector3**: 3D vector operations
- Basic operations: `add`, `sub`, `multiplyScalar`, `copy`, `clone`
- Interpolation: `lerp`
- Transformations: `applyQuaternion`
- Array conversion: `toArray`, `fromArray`

**Quaternion**: Rotation representation
- Construction: `setFromEuler`
- Interpolation: `slerp` (spherical linear interpolation)
- Composition: `multiply`, `multiplyQuaternions`
- Array conversion: `toArray`, `fromArray`

**Euler**: Euler angle representation
- Supports all 6 rotation orders (XYZ, YXZ, ZXY, XZY, YZX, ZYX)
- Conversion: `setFromQuaternion`, `setFromRotationMatrix`
- Array conversion: `toArray`

**Important**: All rotations in the public API are in DEGREES, but internally converted to radians for math operations.

#### 6. **SceneObject** (`src/lib/types/types_sceneModel.ts`)

Represents a scene object with optional markers for hierarchical positioning.

**Properties:**
- `sceneObjectID`: Unique identifier
- `markers`: Record of marker IDs to marker definitions

**Methods:**
- `getMarkerIDs()`: Returns all marker IDs
- `getMarker(markerID)`: Gets a marker with parent reference

**Markers** (`type_sceneObject_marker`):
- `position`: Local position relative to object (Vector3)
- `rotation`: Local rotation relative to object (Euler, in degrees)

---

## Data Flow Example

### 1. Scene Definition
```typescript
const scene: SceneDefinition = [
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
```

### 2. Reconciliation and State Calculation
```typescript
// Reconcile the scene once (processes nodes, resolves timing dependencies)
const reconciled = reconcileScene(scene);
console.log(`Scene duration: ${reconciled.duration}s`);

// User's own animation loop - get state at any time
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  
  const currentTime = (Date.now() - startTime) / 1000;
  const state = reconcile_animationState(reconciled, currentTime);
  
  // Update 3D scene with state.models and state.camera
  state.models.forEach((modelState, modelID) => {
    // Apply modelState.position, modelState.rotation, modelState.opacity
  });
  // Apply state.camera (rotationX, rotationY, target, zoom)
}

animate();
```

### 3. Animation Snapshot Structure
```typescript
interface AnimationSnapshot {
  models: Map<string, ModelAnimationState>;
  camera: CameraAnimationState;
}

interface ModelAnimationState {
  opacity: number;
  position: Vector3;
  rotation: Quaternion;
  cumulativeModelRotation: Quaternion; // For marker calculations
}

interface CameraAnimationState {
  rotationX: number;
  rotationY: number;
  target: Vector3;
  zoom: number;
}
```

---

## Code Review

### Overall Assessment

This is a well-structured TypeScript library for parametric animation sequencing. The codebase demonstrates strong type safety, clear separation of concerns, and a solid architectural foundation. However, there are several areas that need attention, particularly around testing, type safety, and edge case handling.

**Overall Score: 7.5/10** - Production-ready after addressing high-priority issues.

---

### Strengths

#### 1. **Type Safety and TypeScript Usage**
- Excellent TypeScript configuration with strict mode enabled
- Strong type definitions using discriminated unions (`type_keyframe_position`, `type_keyframe_rotation`)
- Proper use of type guards (`isAbsoluteKeyframe`, `isRelativeOrMultipleKeyframe`)
- Good separation between model and camera keyframes

#### 2. **Architecture and Separation of Concerns**
- Clear pipeline architecture: nodes → keyframes → reconciliation → animation state
- Excellent separation of model and camera keyframes for performance
- Modular structure with focused responsibilities
- Clean separation between math utilities, types, and business logic

#### 3. **Math Utilities**
- Custom implementations of Vector3, Quaternion, and Euler classes
- Consistent API with fluent method chaining (`copy()`, `clone()`, `lerp()`, `slerp()`)
- Proper quaternion mathematics for rotations
- Good support for different Euler rotation orders

---

### Issues and Recommendations

#### 🔴 **HIGH PRIORITY**

##### 1. **Missing Test Coverage**
**Issue**: No test files found in the codebase. This is critical for a library.

**Impact**: 
- No validation of core functionality
- Risk of regressions
- Difficult to verify fixes

**Recommendation**: 
- Add comprehensive unit tests using Vitest (already configured)
- Test core reconciliation logic
- Test math utilities (especially quaternion operations)
- Test edge cases (empty scenes, overlapping keyframes, circular dependencies)
- Test time reconciliation with complex dependency chains

**Example Test Structure**:
```typescript
describe('Sequencer', () => {
  it('should load and play a scene', () => { ... });
  it('should handle relative timing', () => { ... });
  it('should throw error for invalid scene', () => { ... });
});

describe('reconcile_animationState', () => {
  it('should interpolate between keyframes', () => { ... });
  it('should handle marker positioning', () => { ... });
});
```

##### 2. **Type Safety Issues**

**Issue 1**: `any` type usage in Sequencer
```typescript
// src/lib/Sequencer.ts:132
private _currentSceneObjects: Set<any> | null = null;
```
**Fix**: Use proper type
```typescript
private _currentSceneObjects: Set<SceneObject> | null = null;
```

**Note**: The `model` property has been removed from SceneObject as it was never used.

##### 3. **Quaternion SLERP Bug**

**Location**: `src/lib/math/Quaternion.ts:76-121`

**Issue**: When `cosHalfTheta >= 0`, the code copies `qb` immediately but then continues with slerp calculation, overwriting the copy incorrectly.

**Current Code**:
```typescript
if (cosHalfTheta < 0) {
  this.w = -qb.w;
  this.x = -qb.x;
  this.y = -qb.y;
  this.z = -qb.z;
  cosHalfTheta = -cosHalfTheta;
} else {
  this.copy(qb);  // ❌ Problem: copies but then overwrites below
}

if (cosHalfTheta >= 1.0) {
  this.w = w;  // ❌ Restores old values, ignoring the copy above
  this.x = x;
  // ...
}
```

**Fix**: Remove the copy in the else branch - interpolation will handle it:
```typescript
if (cosHalfTheta < 0) {
  this.w = -qb.w;
  this.x = -qb.x;
  this.y = -qb.y;
  this.z = -qb.z;
  cosHalfTheta = -cosHalfTheta;
}
// Remove the else branch copy - don't copy here

if (cosHalfTheta >= 1.0) {
  // Already at target, no interpolation needed
  return this;
}
```

##### 4. **Input Validation Missing**

**Location**: `src/lib/Sequencer.ts:90-93`

**Issue**: No validation for `NaN` or `Infinity` values.

**Current Code**:
```typescript
setTime(time: number) {
  this._time = Math.max(0, Math.min(time, this._duration));
  this._emitUpdate();
}
```

**Fix**: Add validation
```typescript
setTime(time: number) {
  if (!Number.isFinite(time)) {
    throw new Error(`Invalid time value: ${time}. Must be a finite number.`);
  }
  this._time = Math.max(0, Math.min(time, this._duration));
  this._emitUpdate();
}
```

#### 🟡 **MEDIUM PRIORITY**

##### 5. **Error Handling**

**Location**: `src/lib/Sequencer.ts:61-64`

**Issue**: Silent failure with only console warning.

**Current Code**:
```typescript
if (!this._keyframes) {
  console.warn('No scene loaded');
  return;
}
```

**Recommendation**: Throw error or use callback
```typescript
if (!this._keyframes) {
  throw new Error('Cannot play: no scene loaded. Call loadScene() first.');
}
```

##### 6. **Performance Optimization**

**Location**: `src/lib/reconciliation/animationState/reconcile_animationState.ts:231-312`

**Issue**: O(n²) complexity - each keyframe iteration may need to look up parent states.

**Current Pattern**:
```typescript
keyframes.forEach((extendedKeyframe) => {
  // Processes each keyframe, may need to look up parent states
  const parentState = modelStates.get(parentSceneObjectID);
});
```

**Recommendation**: Pre-index models by ID for O(1) lookups:
```typescript
// Pre-initialize all objects in first pass
const modelStates = new Map<string, ModelAnimationState>();
keyframes.forEach((extendedKeyframe) => {
  const sceneObjectID = getObjectIDFromKeyframe(extendedKeyframe.keyframe);
  if (!modelStates.has(sceneObjectID)) {
    modelStates.set(sceneObjectID, initialState);
  }
});

// Then process in second pass with guaranteed O(1) lookups
keyframes.forEach((extendedKeyframe) => {
  // All lookups are now O(1)
});
```

##### 7. **Animation Loop Timing**

**Location**: `src/lib/Sequencer.ts:119`

**Issue**: Direct use of `requestAnimationFrame` timestamps can cause jitter and doesn't account for browser throttling.

**Current Code**:
```typescript
const deltaTime = (timestamp - this._previousFrameTime) / 1000;
```

**Recommendation**: Cap deltaTime to prevent large jumps
```typescript
const rawDeltaTime = (timestamp - this._previousFrameTime) / 1000;
const deltaTime = Math.min(rawDeltaTime, 0.1); // Cap at 100ms to prevent jumps
```

##### 8. **Node.js Fallback Implementation**

**Location**: `src/lib/Sequencer.ts:149-155`

**Issue**: Fixed 16ms delay doesn't account for actual elapsed time, causing drift.

**Current Code**:
```typescript
const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
this._animationFrameId = setTimeout(() => {
  loopCallback(now + 16);
}, 16);
```

**Recommendation**: Track actual elapsed time
```typescript
let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
this._animationFrameId = setInterval(() => {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  loopCallback(now);
  lastTime = now;
}, 16);
```

**Note**: Remember to use `clearInterval` instead of `clearTimeout` in pause method.

##### 9. **Documentation**

**Issue**: Missing JSDoc comments for public API methods.

**Missing Documentation For**:
- `Sequencer.play()`, `pause()`, `stop()`, `setTime()`
- Complex reconciliation functions
- Type definitions and their relationships
- Marker positioning algorithm

**Recommendation**: Add comprehensive JSDoc
```typescript
/**
 * Starts playing the animation from the current time position.
 * 
 * @throws {Error} If no scene has been loaded via `loadScene()`
 * @example
 * ```typescript
 * sequencer.loadScene(scene);
 * sequencer.play();
 * ```
 */
play(): void {
  // ...
}
```

#### 🟢 **LOW PRIORITY**

##### 10. **Magic Numbers**

**Location**: Multiple files

**Issue**: Magic numbers scattered throughout code (e.g., `0.001` in Quaternion.slerp, `1/240` in NodeBasicReveal).

**Recommendation**: Extract to named constants
```typescript
// constants.ts
export const QUATERNION_SLERP_EPSILON = 0.001;
export const FLOAT_COMPARISON_EPSILON = 1e-6;
export const MIN_KEYFRAME_DURATION = 1 / 240;
```

##### 11. **Function Length**

**Location**: `src/lib/reconciliation/animationState/reconcile_animationState.ts:213-315`

**Issue**: `_reconcileModelStates` function is 100+ lines long.

**Recommendation**: Extract helper functions:
- `_initializeModelStates()`
- `_processKeyframeOpacity()`
- `_processKeyframeRotation()`
- `_processKeyframePosition()`

##### 12. **Package.json Metadata**

**Issues**:
- Empty `author` field
- `module` field references `index.es.js` but build may not produce it
- Missing repository, homepage fields

**Recommendation**: Fill in metadata
```json
{
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/..."
  },
  "homepage": "https://github.com/...",
  "bugs": "https://github.com/.../issues"
}
```

##### 13. **Memory Management**

**Location**: `src/lib/Sequencer.ts:109`

**Issue**: Arrow function creates closure that may prevent garbage collection.

**Current Code**:
```typescript
private _loop = () => {
  // ...
};
```

**Recommendation**: Use bound method
```typescript
private _loop(): void {
  // ... implementation
}

constructor(options: SequencerOptions = {}) {
  this._options = options;
  this._loop = this._loop.bind(this);
}
```

---

### Code Quality Observations

#### ✅ **Good Practices**
- Consistent naming conventions (camelCase for methods, PascalCase for classes)
- Clear, descriptive function names
- Excellent use of TypeScript features (discriminated unions, type guards)
- Immutable patterns with `clone()` methods
- Good separation of concerns

#### ⚠️ **Areas for Improvement**
- Some functions are too long (consider extracting helpers)
- Some nested conditionals could be simplified
- Consider using early returns to reduce nesting
- Some type assertions (`as any`) could be avoided with better typing

---

### Security Considerations

✅ **Good**:
- No external dependencies (reduces attack surface)
- No eval() or dynamic code execution
- No file system access

⚠️ **Consider**:
- Input validation for user-provided scene definitions
- Validate scene structure before processing (prevent malformed data)
- Consider size limits for scene definitions (prevent DoS)

---

### Testing Recommendations

#### Unit Tests Needed

1. **Sequencer Class**
   - Load scene and verify duration calculation
   - Play/pause/stop functionality
   - Time seeking
   - Loop behavior
   - Error cases (play without scene, invalid time)

2. **Reconciliation Pipeline**
   - Time reconciliation with various dependency patterns
   - Circular dependency detection
   - Unresolved dependency errors
   - Marker positioning calculations
   - Camera state interpolation

3. **Math Utilities**
   - Vector3 operations (add, sub, lerp, applyQuaternion)
   - Quaternion operations (slerp, multiply, setFromEuler)
   - Euler conversions (all rotation orders)
   - Edge cases (zero vectors, identity quaternions)

4. **Node Types**
   - Each node type's reconcile() method
   - Relative ID generation
   - Keyframe generation correctness

#### Integration Tests Needed

1. **End-to-End Scenarios**
   - Complete scene with multiple models and camera
   - Complex timing dependencies
   - Marker-based positioning chains
   - Chapter transitions

2. **Performance Tests**
   - Large scenes (100+ keyframes)
   - Many simultaneous animations
   - Animation state calculation performance

---

### Development Guidelines

#### Adding New Node Types

1. Create a new class in `src/lib/reconciliation/nodes/`
2. Implement `reconcile()` method returning keyframes
3. Implement `getRelativeID()` if relative timing is needed
4. Add to `type_reconciliation_node` union type
5. Add tests

#### Adding New Keyframe Properties

1. Update `type_keyframe_model` or `type_keyframe_camera`
2. Update reconciliation logic in `reconcile_animationState.ts`
3. Update time reconciliation if timing is affected
4. Add tests

#### Modifying Math Utilities

1. Ensure backward compatibility or document breaking changes
2. Add tests for edge cases
3. Verify performance impact
4. Update documentation

---

### Build and Development

#### Build Commands
```bash
npm run build    # TypeScript compilation + Vite build
npm run dev      # Development mode with Vite
npm test         # Run tests (when implemented)
```

#### Project Structure
```
src/
  lib/
    math/              # Vector3, Quaternion, Euler
    reconciliation/    # Core animation logic
      animationState/  # State interpolation
      keyframes/       # Keyframe processing pipeline
      nodes/           # Node type implementations
    types/             # Type definitions
    utils/             # Utility functions
    Sequencer.ts       # Main public API
  index.ts             # Public exports
```

#### TypeScript Configuration
- Target: ESNext
- Module: ESNext
- Strict mode: Enabled
- No unused locals/parameters: Enabled
- Declaration files: Generated

---

### Summary

This is a well-architected library with strong foundations. The main gaps are:
1. **Testing** - Critical for library reliability
2. **Type Safety** - Remove `any` types
3. **Bug Fixes** - Quaternion slerp bug needs fixing
4. **Error Handling** - More explicit error handling needed

**Priority Order**:
1. 🔴 Add comprehensive test suite
2. 🔴 Fix Quaternion slerp bug
3. 🔴 Remove `any` types
4. 🔴 Add input validation
5. 🟡 Improve error handling
6. 🟡 Add JSDoc documentation
7. 🟡 Optimize performance
8. 🟢 Refactor long functions
9. 🟢 Extract magic numbers

Once these issues are addressed, this library will be production-ready and maintainable.

---

## For LLM Agents

### When Modifying This Codebase

1. **Always maintain type safety** - Avoid `any` types, use proper generics
2. **Follow the pipeline pattern** - Nodes → Keyframes → Reconciliation → State
3. **Test your changes** - Add tests for new features or bug fixes
4. **Document public APIs** - Add JSDoc for new public methods
5. **Consider performance** - This library processes animations in real-time
6. **Handle edge cases** - Empty scenes, invalid inputs, circular dependencies
7. **Maintain immutability** - Use `clone()` when modifying math objects
8. **Degrees vs Radians** - Public API uses degrees, internal math uses radians

### Common Patterns

- **Creating a new node type**: Extend existing node classes, implement `reconcile()` and `getRelativeID()`
- **Adding keyframe properties**: Update types, reconciliation logic, and tests
- **Math operations**: Always clone before modifying to maintain immutability
- **Time handling**: Use the reconciliation pipeline, don't manually calculate times

### Key Files to Understand

1. `src/lib/Sequencer.ts` - Main API
2. `src/lib/reconciliation/keyframes/types.ts` - Core type definitions
3. `src/lib/reconciliation/animationState/reconcile_animationState.ts` - State calculation
4. `src/lib/reconciliation/nodes/nodes_reconcile.ts` - Node processing
5. `src/lib/math/` - Math utilities

### Questions to Consider

- Does this change affect the reconciliation pipeline?
- Are there edge cases I should handle?
- Do I need to update type definitions?
- Should I add tests for this?
- Is this a breaking change?

### Documentation Workflow for AI Agents

When working with the documentation system, follow these rules:

#### Documentation Pipeline

The documentation follows this pipeline:
```
TSDoc comments in TypeScript source
        ↓
TypeDoc (with Markdown plugin)
        ↓
Generated Markdown files (API docs)
        ↓
Astro (Starlight) renders the Markdown
```

#### Critical Rules

1. **Never attempt to parse TSDoc directly inside Astro.**  
   Astro cannot parse TSDoc. Always use TypeDoc to generate Markdown first.

2. **Always generate API documentation using TypeDoc before building the Astro site.**  
   Run `npm run docs:generate` before `npm run docs:build`.

3. **Never modify generated Markdown manually.**  
   All API documentation is generated by TypeDoc. Only modify TSDoc comments in source files.

4. **Do not reinvent the documentation system**—follow this pipeline exactly.

5. **Ensure all public APIs have TSDoc comments.**  
   All exported classes, interfaces, types, and functions must have comprehensive TSDoc documentation.

#### Directory Structure

- TypeScript code lives in `src/`.
- API docs generated into `docs/api/` (via TypeDoc).
- Astro site reads from `docs/src/content/docs/api` (symlinked to `../../../api`) for Starlight's autogenerate feature.
- Astro pages and guide documents live in `docs/src/content/docs`.
- TypeDoc configuration is in `typedoc.json` at the root.

#### Build Commands

- `npm run docs:generate` - Generate TypeDoc API docs
- `npm run docs:dev` - Run Astro dev server
- `npm run docs:build` - Generate TypeDoc + build Astro site
- `npm run docs:preview` - Preview built Astro site

#### TSDoc Standards

When adding or modifying public APIs:

1. **All public APIs must have TSDoc comments** using the `/** */` format.
2. **Use `@param` for parameters**, `@returns` for return values, `@remarks` for additional notes.
3. **Include `@example` blocks** for complex APIs.
4. **Document all properties** of interfaces and types.
5. **Use `@internal`** for methods that are not part of the public API.

#### Workflow for Adding/Modifying Documentation

**When adding new APIs:**
1. Add comprehensive TSDoc comments to the new API.
2. Run `npm run docs:generate` to regenerate API docs.
3. Verify the docs appear correctly in `docs/src/content/api`.
4. Test locally with `npm run docs:dev`.
5. Commit both source code changes and generated API docs.

**When modifying documentation:**
1. For API documentation: Modify TSDoc comments in source files, then regenerate.
2. For guide pages: Edit Markdown files in `docs/src/content/docs/`.
3. Always test locally before committing.

#### Common Issues

- **API docs not appearing**: Run `npm run docs:generate` first.
- **Symlink issues**: Ensure `docs/src/content/docs/api` is a symlink to `../../../api` (for CI builds, the workflow creates this automatically).
- **Build failures**: Check that TypeDoc runs successfully before Astro build.

#### TypeDoc Configuration

- Entry points: `src/2d/index.ts` and `src/3d/index.ts`
- Output: `docs/api`
- Plugin: `typedoc-plugin-markdown`
- Excludes: private, protected, and internal members

#### CI/CD

- GitHub Actions workflow: `.github/workflows/docs.yml`
- Automatically builds and deploys on push to `main` branch
- Deploys to GitHub Pages
- Build order: `install → typedoc → astro build → deploy`

