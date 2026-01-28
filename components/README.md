# Components Directory

This directory contains all React components for the Setu Voice-to-ONDC Gateway application.

## Structure

```
components/
 ui/           # Shadcn/UI base components (auto-generated)
 README.md     # This file
```

## Shadcn/UI Setup

Shadcn/UI has been initialized with the following configuration:

- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React
- **TypeScript**: Enabled
- **React Server Components**: Enabled

### Adding Components

To add Shadcn/UI components, use the CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add toast
# etc.
```

Components will be automatically added to the `components/ui/` directory.

### Configuration Files

- `components.json` - Shadcn/UI configuration
- `tailwind.config.ts` - Tailwind CSS with Shadcn theme
- `app/globals.css` - CSS variables for theming
- `lib/utils.ts` - Utility function for class merging

### Available Components (To Be Installed)

According to the task list, the following components need to be installed:

1. Button component (Task 1.3.2)
2. Card component (Task 1.3.3)
3. Toast/Sonner component (Task 1.3.4)
4. Badge component (Task 1.3.5)
5. Dialog component (Task 1.3.6)
6. Select/Dropdown component (Task 1.3.7)

### Theme Customization

The application uses CSS variables for theming, supporting both light and dark modes. Variables are defined in `app/globals.css` and can be customized as needed.

### Path Aliases

The following path aliases are configured:

- `@/components` -> `./components`
- `@/lib` -> `./lib`
- `@/ui` -> `./components/ui`
- `@/hooks` -> `./hooks`

These aliases are defined in both `tsconfig.json` and `components.json`.
