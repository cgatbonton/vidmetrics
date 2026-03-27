# Patterns Reference

## Context Patterns

### Standard Context Structure
All contexts follow this pattern:
1. `'use client'` directive
2. TypeScript interface for context type
3. `createContext<Type | undefined>(undefined)`
4. Provider component with `useMemo` for value
5. Custom hook with `useContext` + error check

### Naming Conventions
| Element | Pattern | Example |
|---------|---------|---------|
| Context | `[Feature]Context` | `AuthContext`, `DateRangeContext` |
| Provider | `[Feature]Provider` | `AuthProvider`, `DateRangeProvider` |
| Hook | `use[Feature]` | `useAuth`, `useDateRange` |
| Type | `[Feature]ContextType` | `AuthContextType` |

### Complex Context Pattern
For complex state, extract logic into hooks:
- `contexts/[feature]/use[Feature]State.ts`
- `contexts/[feature]/use[Feature]Operations.ts`

### Combined Provider Pattern
When multiple related contexts have dependencies:
```typescript
export function CombinedProvider({ children }) {
  return (
    <ProviderA>
      <ProviderB>
        {children}
      </ProviderB>
    </ProviderA>
  );
}
```

## Zustand Patterns

### Simple Store
```typescript
export const useStore = create<State>((set, get) => ({
  // state and actions
}));
```

### With Immer (for nested updates)
```typescript
export const useStore = create<State>()(
  immer((set) => ({
    // use mutable syntax
  }))
);
```

### With Persistence
```typescript
export const useStore = create<State>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'storage-key',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ /* only persist these */ }),
    }
  )
);
```

### Selector Hooks Pattern
Always export granular selectors:
```typescript
export const useData = () => useStore((state) => state.data);
export const useActions = () => useStore(useShallow(actionsSelector));
```

## File Organization

### Context Locations (adapt to your project's directory structure)
- `contexts/AuthContext.tsx` - Global auth
- `contexts/[Feature]Context.tsx` - Feature-specific context
- `contexts/[feature]/` - Complex contexts with extracted hooks

### Store Locations (adapt to your project's directory structure)
- `stores/[feature]Store.ts` - Global stores
- `lib/stores/[feature]/` - Feature-specific stores with complex state
