# Nutritional Scheduling Application - Design Guidelines

## Design Approach
**System**: Material Design 3 principles with modern dashboard aesthetics
**Rationale**: Information-dense nutrition data requires clear hierarchy, consistent patterns, and proven usability standards. Inspired by health-tech leaders like MyFitnessPal and fitness dashboards.

## Core Design Elements

### Typography Hierarchy
- **Primary Headlines**: Font family: Inter or Roboto, Weight: 600-700, Size: 2xl to 4xl
- **Section Headers**: Weight: 600, Size: xl to 2xl
- **Body Text**: Weight: 400, Size: base
- **Data/Metrics**: Weight: 500-600, Size: lg to xl (for calorie counts and nutritional info)
- **Labels/Captions**: Weight: 400-500, Size: sm to base

### Layout System
**Spacing Units**: Consistent use of Tailwind units 3, 4, 6, 8, 12, 16
- Card padding: p-6
- Section spacing: py-12 or py-16
- Component gaps: gap-4 or gap-6
- Grid gaps: gap-6 or gap-8

### Application Structure

#### User Dashboard
**Layout**: Two-column desktop (sidebar navigation + main content area)
- Sidebar: w-64, fixed position with navigation items
- Main area: flex-1 with max-w-7xl container

**Daily Schedule View**:
- Card-based meal breakdown (4 cards: Breakfast, Lunch, Dinner, Snacks)
- Each card displays: meal name, calorie target, macros breakdown (protein/carbs/fats), "Replace Meal" button
- Grid layout: grid-cols-1 md:grid-cols-2 gap-6
- Progress ring/bar showing daily calorie consumption vs target at top

**Meal Replacement Modal**:
- Full-screen overlay with grid of alternative meals
- Each alternative shows: food image placeholder, name, calorie count, macro comparison
- Filter chips at top (calorie range: -50 to +50 from target)
- Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4

#### Grocery Scanner Section
**Layout**: Centered single-column with max-w-2xl
- Large upload area (min-h-96) with drag-and-drop zone
- Dotted border, centered upload icon and text
- After upload: Image preview with loading state, then generated recipe card below
- Recipe card includes: ingredient list, instructions, nutritional breakdown, "Add to Schedule" button

#### Specialist Panel
**Layout**: Dashboard with data tables and overview cards
- Top row: 4 stat cards (Total Users, Active Plans, Compliance Rate, Pending Reviews)
- Stats cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- User management table with columns: Name, Current Plan, Compliance %, Last Active, Actions
- Sortable headers, pagination controls
- Row actions: View Details, Edit Schedule, Message User

**User Detail View**:
- Split layout: User info sidebar (w-80) + main compliance tracking area
- Compliance calendar: 7-column grid showing meal completion status
- Weekly/monthly toggle tabs
- Chart showing calorie adherence over time (line graph placeholder area)

### Component Library

**Navigation**:
- Top app bar: h-16 with logo, user avatar, notifications
- Side navigation: Vertical list with icons + labels, active state indicator

**Cards**:
- Elevated appearance with rounded corners (rounded-lg)
- Consistent padding: p-6
- Header with title + optional action button
- Content area with appropriate spacing

**Forms**:
- Full-width inputs with labels above
- Input height: h-12
- Form groups with space-y-4
- Primary action buttons at bottom-right

**Buttons**:
- Height: h-10 or h-12
- Padding: px-6
- Rounded: rounded-md
- Primary actions: Higher visual weight
- Secondary actions: Lower visual weight

**Data Display**:
- Tables: Striped rows, hover states
- Metrics: Large numbers with smaller unit labels
- Progress indicators: Circular for percentages, horizontal bars for goals

**Modals/Overlays**:
- Centered with max-width constraints
- Backdrop overlay
- Close button top-right
- Action buttons bottom-right

### Images
**Hero Section**: No traditional hero needed - this is a dashboard application
**Product Images**:
- Meal cards: Square aspect ratio food images (aspect-square)
- Grocery scanner: User-uploaded images displayed in 16:9 or 4:3 aspect
- Recipe results: Featured image at top of generated recipe card
- User avatars: Circular, consistent sizes (h-10 w-10 for lists, h-20 w-20 for profiles)

### Responsive Behavior
- Mobile: Single column, stacked cards, collapsible sidebar
- Tablet: 2-column grids, visible sidebar
- Desktop: Full multi-column layouts, persistent sidebar

### Accessibility
- Consistent focus indicators on all interactive elements
- Proper heading hierarchy throughout
- ARIA labels for icon-only buttons
- Sufficient contrast for all text over backgrounds
- Form inputs with associated labels

**Critical Quality Standards**: Create polished, production-ready interfaces with comprehensive data visualization, complete user flows, and professional dashboard layouts that demonstrate expertise in health-tech application design.