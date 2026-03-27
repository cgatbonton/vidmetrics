---
name: prop-drilling-minimizer
description: Search the codebase for excessive prop drilling. Props should not be drilled more than 2 levels deep. Use this skill when the user invokes /prop, when refactoring components, or proactively when noticing prop drilling issues during development. This skill identifies violations and automatically refactors using React Context, state management stores, or component composition.
---

This skill identifies and automatically fixes prop drilling violations where props pass through more than 2 component levels. The goal is cleaner, more maintainable code.

## Prop Drilling Rule

**Maximum allowed depth: 2 levels**

- Level 0: Component that owns/creates the state
- Level 1: Direct child receiving prop
- Level 2: Grandchild receiving prop (MAXIMUM)
- Level 3+: VIOLATION - requires refactoring

## Detection Workflow

### Step 1: Identify Prop Drilling Violations

To detect prop drilling, analyze component hierarchies for:

1. **Pass-through props**: Props received and immediately passed to children without use
2. **Large prop interfaces**: Components accepting 6+ props that mostly flow downstream
3. **Repeated prop patterns**: Same props appearing across multiple component levels

Search patterns to identify violations:
- Components with `...props` spread to children
- Interfaces with many handler props (`onXxx`, `handleXxx`)
- Props passed to intermediate components that don't use them

### Step 2: Trace the Prop Path

For each potential violation:
1. Find where the prop originates (state owner)
2. Map each component it passes through
3. Identify the final consumer(s)
4. Count the levels: if > 2, mark for refactoring

## Refactoring Strategy Selection

Choose the appropriate pattern based on the use case:

### Use React Context When:
- Props are related state/callbacks for a component subtree
- Multiple sibling components need the same data
- The data scope is bounded (not app-wide)
- Following existing context patterns in the project

### Use Zustand Store When:
- State is needed across unrelated component trees
- State needs persistence (localStorage)
- Complex state updates with immer
- Performance-critical with granular selectors

### Use Component Composition When:
- Simple parent-child relationships
- Props only needed by specific deeply-nested children
- Can restructure to use children/render props pattern

## React Context Implementation

Follow project conventions (adapt directory paths to your project's structure):

```typescript
'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, ReactNode } from 'react';

// 1. Define typed interface
interface FeatureContextType {
  // State
  data: DataType;
  isLoading: boolean;
  // Actions
  updateData: (value: DataType) => void;
  resetData: () => void;
}

// 2. Create context with undefined default
const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

// 3. Provider props interface
interface FeatureProviderProps {
  children: ReactNode;
  // Any required props
}

// 4. Provider component with memoized value
export const FeatureProvider = ({ children }: FeatureProviderProps) => {
  const [data, setData] = useState<DataType>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const updateData = useCallback((value: DataType) => {
    setData(value);
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
  }, []);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo<FeatureContextType>(() => ({
    data,
    isLoading,
    updateData,
    resetData,
  }), [data, isLoading, updateData, resetData]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};

// 5. Custom hook with error boundary
export const useFeature = (): FeatureContextType => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
```

### Context Naming Conventions
- Context: `[Feature]Context`
- Provider: `[Feature]Provider`
- Hook: `use[Feature]`
- Type: `[Feature]ContextType`
- Props: `[Feature]ProviderProps`

### Context File Location
- Place in your project's contexts directory (adapt to your project's directory structure)
- For feature-specific contexts, create a subdirectory: `contexts/[feature]/`
- Export via barrel file: `contexts/[feature]/index.ts`

## Zustand Store Implementation

Follow project conventions (adapt directory paths to your project's structure):

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/shallow';

// 1. Define typed interface
interface FeatureState {
  // State
  data: DataType;
  isLoading: boolean;
  // Actions
  setData: (data: DataType) => void;
  updateField: (key: keyof DataType, value: unknown) => void;
  reset: () => void;
}

// 2. Create store with immer for mutable syntax
export const useFeatureStore = create<FeatureState>()(
  immer((set) => ({
    data: initialData,
    isLoading: false,

    setData: (data) => set((state) => {
      state.data = data;
    }),

    updateField: (key, value) => set((state) => {
      state.data[key] = value;
    }),

    reset: () => set((state) => {
      state.data = initialData;
      state.isLoading = false;
    }),
  }))
);

// 3. Export granular selector hooks for performance
export const useFeatureData = () => useFeatureStore((state) => state.data);
export const useFeatureLoading = () => useFeatureStore((state) => state.isLoading);

// 4. Export grouped action hooks with useShallow
const actionsSelector = (state: FeatureState) => ({
  setData: state.setData,
  updateField: state.updateField,
  reset: state.reset,
});

export const useFeatureActions = () => useFeatureStore(useShallow(actionsSelector));

// 5. Export getState for non-hook access
export const getFeatureState = () => useFeatureStore.getState();
```

### Zustand Naming Conventions
- Store hook: `use[Feature]Store`
- Selector hooks: `use[Feature]Data`, `use[Feature]Loading`
- Action hooks: `use[Feature]Actions`
- State getter: `get[Feature]State`

### Zustand File Location
- Global stores: `stores/[feature]Store.ts` (adapt to your project's directory structure)
- Feature-specific: `lib/stores/[feature]/use[Feature]Store.ts`

## Component Composition Implementation

For simple cases, restructure to avoid drilling:

```typescript
// BEFORE: Prop drilling through Parent
function GrandParent() {
  const [data, setData] = useState(initialData);
  return <Parent data={data} onDataChange={setData} />;
}

function Parent({ data, onDataChange }) {
  return <Child data={data} onDataChange={onDataChange} />;  // Just passing through
}

function Child({ data, onDataChange }) {
  return <div onClick={() => onDataChange(newData)}>{data}</div>;
}

// AFTER: Use composition
function GrandParent() {
  const [data, setData] = useState(initialData);
  return (
    <Parent>
      <Child data={data} onDataChange={setData} />
    </Parent>
  );
}

function Parent({ children }) {
  return <div className="layout">{children}</div>;
}

function Child({ data, onDataChange }) {
  return <div onClick={() => onDataChange(newData)}>{data}</div>;
}
```

## Refactoring Execution

### Step 1: Create the State Management Solution
Based on strategy selection, create:
- New context file in your contexts directory OR
- New store file in your stores directory OR
- Restructure component hierarchy

### Step 2: Update Parent Component
- Wrap children with Provider (for Context)
- Remove drilled props from intermediate components
- Import and use the new hook/store in consuming components

### Step 3: Update Consuming Components
Replace prop access with hook usage:

```typescript
// BEFORE
function DeepChild({ data, onUpdate }: Props) {
  return <button onClick={() => onUpdate(newData)}>{data}</button>;
}

// AFTER (Context)
function DeepChild() {
  const { data, updateData } = useFeature();
  return <button onClick={() => updateData(newData)}>{data}</button>;
}

// AFTER (Zustand)
function DeepChild() {
  const data = useFeatureData();
  const { updateData } = useFeatureActions();
  return <button onClick={() => updateData(newData)}>{data}</button>;
}
```

### Step 4: Clean Up
- Remove unused props from intermediate component interfaces
- Delete pass-through prop code
- Update imports

## Verification Checklist

After refactoring, verify:

1. **Build passes**: Run the project's build command - no TypeScript errors
2. **Functionality preserved**: State updates work correctly
3. **No infinite loops**: Check useEffect/useMemo dependencies
4. **Performance**: Use React DevTools to verify no unnecessary re-renders
5. **Props reduced**: Intermediate components no longer receive pass-through props
