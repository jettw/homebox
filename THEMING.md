# Theming Guide

HomeBox uses Shadcn UI with `next-themes` for dark mode and theme switching.

## Theme Provider

The theme provider is configured in `app/layout.tsx` and wraps the entire application:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {/* Your app */}
</ThemeProvider>
```

### Configuration Options

- **`attribute="class"`**: Uses CSS classes for theming (e.g., `.dark`)
- **`defaultTheme="system"`**: Follows system preference by default
- **`enableSystem`**: Enables system theme detection
- **`disableTransitionOnChange`**: Prevents flickering during theme changes

## Theme Toggle

A theme toggle button is available in the site header. Users can choose:
- **Light**: Force light mode
- **Dark**: Force dark mode
- **System**: Follow system preference

## Using Theme in Components

### Reading Current Theme

```tsx
"use client"

import { useTheme } from "next-themes"

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  )
}
```

### Theme-Aware Styling

Use Tailwind's `dark:` modifier:

```tsx
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  This adapts to the theme
</div>
```

## Customizing Theme Colors

Edit `app/globals.css` to customize theme colors:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

## CSS Variables

The theme uses CSS variables that automatically switch between light and dark:

- `--background`: Page background
- `--foreground`: Text color
- `--primary`: Primary color (buttons, links)
- `--secondary`: Secondary elements
- `--accent`: Accent color
- `--destructive`: Error/delete actions
- `--muted`: Muted text/backgrounds
- `--border`: Border colors
- `--input`: Input field styling
- `--ring`: Focus ring color

## Avoiding Flash of Unstyled Content

The theme provider uses `suppressHydrationWarning` on the `<html>` tag to prevent flickering:

```tsx
<html lang="en" suppressHydrationWarning>
  {/* ... */}
</html>
```

## Custom Themes

To add custom theme options beyond light/dark:

1. Define theme colors in `globals.css`:
   ```css
   [data-theme="blue"] {
     --primary: 221 83% 53%;
     /* ... */
   }
   ```

2. Update the theme toggle to include your custom theme:
   ```tsx
   <DropdownMenuItem onClick={() => setTheme("blue")}>
     Blue Theme
   </DropdownMenuItem>
   ```

## Testing Themes

1. Use the theme toggle in the header
2. Test with system preference: 
   - macOS: System Preferences → General → Appearance
   - Windows: Settings → Personalization → Colors
3. Verify components look good in both themes

## Best Practices

1. **Always use semantic color variables** (e.g., `bg-background`, `text-foreground`) instead of hardcoded colors
2. **Test dark mode** for every new component
3. **Use `dark:` variants** sparingly - rely on CSS variables when possible
4. **Avoid absolute colors** like `bg-white` or `text-black` (use `bg-background` and `text-foreground`)
5. **Check contrast ratios** in both themes for accessibility

## Troubleshooting

### Theme not applying
- Check that `ThemeProvider` wraps your app
- Verify `suppressHydrationWarning` is on `<html>` tag
- Clear browser cache

### Flickering on page load
- Ensure `disableTransitionOnChange` is set
- Check for conflicting theme scripts

### System theme not detected
- Verify `enableSystem` is true
- Check browser permissions for system preferences

