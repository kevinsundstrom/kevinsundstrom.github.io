# Custom GitHub Copilot Agents

This directory contains custom agent configurations for GitHub Copilot that help with specific tasks on the kevinsundstrom.com website.

## Available Agents

### Frontend Visual Updates Agent

**File:** `frontend-visual.agent.yml`

**Purpose:** Specialized agent for making visual updates to the website including CSS styling, theme modifications, layout changes, and responsive design updates.

**Capabilities:**
- CSS styling changes and theme modifications
- HTML structure updates for visual elements
- Color scheme adjustments (light/dark mode)
- Layout and spacing improvements
- Typography and font adjustments
- Responsive design updates
- Visual consistency improvements

**When to use this agent:**
- Making any visual or styling changes to the website
- Updating colors, fonts, spacing, or layout
- Adjusting the light/dark theme appearance
- Improving responsive design
- Enhancing visual accessibility

**Example requests:**
```
@frontend-visual Update the hero section spacing on the homepage
@frontend-visual Change the brand color from indigo to blue
@frontend-visual Improve the button hover effects
@frontend-visual Adjust the dark mode background to be slightly lighter
@frontend-visual Make the navigation bar more prominent
@frontend-visual Increase font sizes for better mobile readability
```

**What it knows:**
- The site's CSS custom property system (variables like `--bg-primary`, `--text-primary`)
- The theme.js implementation for dark/light mode switching
- The existing visual design language and brand colors
- Responsive design patterns used throughout the site
- WCAG AA accessibility requirements

**Best practices:**
- The agent will always test changes in both light and dark modes
- It will verify responsive behavior at different screen sizes
- It maintains accessibility standards (WCAG AA)
- It takes screenshots to show before/after comparisons
- It makes minimal, focused changes to achieve the visual goal

## How to Use Custom Agents

1. **In GitHub Issues/Pull Requests:** Mention the agent using `@` followed by the agent name (e.g., `@frontend-visual`)

2. **In GitHub Copilot Chat:** Reference the agent when asking for help with visual updates

3. **When Creating Issues:** You can assign issues to specific agents by mentioning them in the issue description

## Agent Architecture

Each agent configuration file (`.agent.yml`) contains:
- **name**: The agent's display name
- **description**: What the agent does and when to use it
- **instructions**: Detailed instructions for the agent's behavior and expertise
- **tools**: List of tools the agent can use (file editing, browser testing, etc.)
- **model**: The AI model powering the agent

## Adding New Agents

To add a new custom agent:

1. Create a new `.agent.yml` file in this directory
2. Define the agent's name, description, instructions, and tools
3. Document the agent in this README
4. Test the agent configuration is valid YAML

## Notes

- Agents are specialized for specific tasks to provide better, more focused assistance
- Each agent has its own expertise area and should be used for tasks within that domain
- Agents have access to specific tools that are relevant to their purpose
- The instructions define the agent's knowledge, workflow, and best practices
