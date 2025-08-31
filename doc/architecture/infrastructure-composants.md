# Infrastructure Composants MVP

## Architecture Évolutive

L'infrastructure composants HerbisVeritas suit le principe de simplicité évolutive avec migration progressive MVP → V2.

## Structure Progressive

```
src/components/
├── ui/                 # shadcn/ui + messages centralisés
├── features/           # Business logic avec AuthMessage
└── layout/             # Responsive + évolutif
```

## Patterns Adoptés

### Extensible Props Pattern
```tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  // V2 ready (optionnel)
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg' 
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        variants[variant],
        sizes[size],
        props.className
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}
```

### Messages Integration
```tsx
interface FormInputProps extends InputProps {
  validation?: (value: string) => AuthMessage | null
  showError?: boolean
}

export function FormInput({ validation, showError = true, ...props }: FormInputProps) {
  const [error, setError] = useState<AuthMessage | null>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (validation) {
      const result = validation(value)
      setError(result)
    }
    props.onChange?.(e)
  }
  
  return (
    <div className="form-input">
      <Input {...props} onChange={handleChange} />
      {showError && error && (
        <Alert type={error.type} className="mt-1">
          {formatAuthMessage(error)}
        </Alert>
      )}
    </div>
  )
}
```

### Progressive Enhancement
MVP vers V2 sans breaking changes avec compound components optionnels et props étendues.

## Timeline Intégrée

### Phase MVP (Semaines 3-5)
- Composants base avec shadcn/ui
- Forms avec messages AuthMessage
- State management évolutif
- Tests TDD composants

### Phase V2 (Post-launch)
- Enhanced props tous composants
- Compound components pattern
- Design tokens system complet