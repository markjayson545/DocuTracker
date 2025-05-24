# DocuTracker CSS Architecture Guide

## Overview

This document outlines how CSS is organized in the DocuTracker application to ensure maintainability, consistency, and reduced duplication. Our CSS architecture is based on a global component system that centralizes common styles while allowing for page-specific customizations.

### Key Features

- **Centralized Variables**: All CSS variables (111 in total) are defined in a single `variables.css` file
- **Component-Based Structure**: Modular CSS files organized by component type
- **Import Hierarchy**: Clear import structure ensures variables are available everywhere
- **Reduced Duplication**: No duplicate style definitions across the application

## Directory Structure

```
css/
├── global/
│   ├── master.css           # Imports all global stylesheets
│   ├── variables.css        # Centralized CSS variables
│   ├── utilities.css        # Utility classes and base styles
│   ├── layouts.css          # Layout components
│   ├── buttons.css          # Button styles
│   ├── forms.css            # Form elements and controls
│   ├── cards.css            # Card components
│   ├── animations.css       # Animation keyframes and classes
│   ├── header-footer.css    # Header and footer styles
│   ├── sidebar.css          # Sidebar navigation
│   └── user-dropdown.css    # User dropdown menu
├── user-dashboard.css       # Page-specific styles
├── user-profile.css         # Page-specific styles
├── user-settings.css        # Page-specific styles
└── ...other page-specific styles
```

## Using Global CSS

### In HTML Files

To use the global CSS components in your HTML file, include the master.css file before any page-specific CSS:

```html
<head>
    <!-- Global CSS First -->
    <link rel="stylesheet" href="css/global/master.css">
    
    <!-- Then Page-specific CSS -->
    <link rel="stylesheet" href="css/your-page.css">
    
    <!-- External libraries like FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
</head>
```

The order is important because:
1. `master.css` imports `variables.css` first, making all variables available
2. The global components use these variables for consistency
3. Page-specific CSS can override global styles when necessary

### Using CSS Variables

All CSS variables are centralized in `variables.css` to maintain consistency across the application:

```css
/* In page-specific CSS files */
@import url('../css/global/variables.css');

.my-component {
    background-color: var(--primary-color);
    box-shadow: var(--shadow);
    border-radius: var(--border-radius);
}
```

This ensures that all components use the same design tokens and visual language.

### Creating New Pages

When creating new pages:

1. Always include the global master.css first in your HTML
2. Then add your page-specific CSS file
3. Import variables.css at the top of your page-specific CSS file
4. Keep page-specific styles limited to unique elements and layouts
5. Use global components whenever possible

### Modifying Global Styles

When you need to modify global styles:

1. For variable changes, update `variables.css`
2. For component changes, identify the appropriate global CSS file
2. Make changes that maintain backward compatibility
3. Test changes across multiple pages to ensure they don't break existing designs
4. Document any significant changes

## Global Component Reference

### Utilities (utilities.css)

Contains:
- CSS variables/custom properties
- Typography utilities
- Spacing utilities (margins, paddings)
- Display utilities (flex, grid, etc.)
- Color utilities
- Border utilities
- Shadow utilities

### Buttons (buttons.css)

Contains:
- Base button styles
- Button variations (primary, secondary, etc.)
- Button sizes
- Button states (hover, active, disabled)
- Icon buttons

Usage:
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-danger">Danger Button</button>
```

### Forms (forms.css)

Contains:
- Form layouts
- Input fields
- Labels
- Checkboxes and radio buttons
- Toggle switches
- Form validation states
- Select dropdowns
- File uploads

Usage:
```html
<div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" id="email" class="form-control">
</div>
```

### Cards (cards.css)

Contains:
- Basic card structure
- Card variations
- Card headers and footers
- Card content layouts
- Card actions

Usage:
```html
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        Content goes here
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Action</button>
    </div>
</div>
```

### Layouts (layouts.css)

Contains:
- Grid systems
- Container classes
- Common layout patterns
- Responsive layout utilities
- Spacing systems

Usage:
```html
<div class="container">
    <div class="row">
        <div class="col-6">Half width column</div>
        <div class="col-6">Half width column</div>
    </div>
</div>
```

### Animations (animations.css)

Contains:
- Animation keyframes
- Animation utility classes
- Transition helpers

Usage:
```html
<div class="card animate-fade-in">
    This card will fade in
</div>
```

## Best Practices

1. **Use CSS Variables**: Always use variables from `variables.css` for colors, spacing, etc.
2. **Don't Duplicate Styles**: Check global CSS files before creating new styles
3. **Mobile First**: Design for mobile first, then enhance for larger screens
4. **Class Naming**: Use descriptive, purpose-oriented class names
5. **Avoid !important**: Only use when absolutely necessary
6. **Import Order**: In HTML files, always load global CSS before page-specific CSS
7. **Component Over Page**: When creating new styles, consider if they could be reused across pages

## Variables Overview

Our `variables.css` file contains centralized design tokens for:

- Typography (fonts, sizes, weights)
- Colors (primary, secondary, accent)
- Spacing and sizing
- Shadows and effects
- Animation timings
- Border radius
- Z-index values

Using these variables ensures visual consistency across the application and makes theme changes much easier.
5. **Maintain Variables**: Use CSS variables for consistent theming
6. **Comment Code**: Add comments for complex CSS selectors or properties
7. **Keep Specificity Low**: Avoid deeply nested selectors
8. **Minimize Page-Specific CSS**: Move common patterns to global files

## Updating Global CSS

When you need to add or modify global CSS:

1. Identify if the change belongs in an existing global file
2. If creating new components, consider whether they should be global
3. Test changes across multiple pages
4. Update this documentation as needed

## Extending the System

To add new global components:

1. Create your new component CSS file in the global directory
2. Import the variables.css file at the top
3. Add your new file to master.css in the appropriate section
4. Document the new component in this README

## CSS Architecture Validation

We've included several scripts to help maintain our CSS architecture:

- `validate-css-architecture.sh`: Validates that our CSS architecture follows our guidelines
- `update-css-order.sh`: Ensures HTML files load CSS in the correct order
- `update-css-imports.sh`: Adds missing variable imports to CSS files
- `remove-duplicate-variables.sh`: Removes duplicate variable declarations

Run these scripts after making changes to ensure consistency:

1. Create a new CSS file in the global directory
2. Add the new file to master.css imports
3. Document the component in this guide
4. Update the HTML files that need to use the component
