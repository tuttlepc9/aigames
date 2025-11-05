# Pixel Painter Defense - Color Battle

A browser-based battle simulator where you draw armies with different colors and watch them fight to the death!

## How to Play

1. **Open the game**: Open `index.html` in any modern web browser

2. **Draw your armies**:
   - Select a color from the palette (8 colors available)
   - Draw on the canvas by clicking/dragging or tapping/swiping
   - Each color represents a different team
   - Adjust brush size to control area coverage
   - Adjust unit density to control how many units spawn per stroke

3. **Create multiple teams**:
   - Switch between colors to create different teams
   - You need at least 2 different color teams to start a battle
   - Strategic placement matters - spread out or cluster your units!

4. **Start the battle**:
   - Click "Start Battle!" when you're ready
   - Watch your armies fight autonomously
   - Units will automatically find and attack the nearest enemy (different color)

5. **Victory conditions**:
   - Battle continues until only one color remains
   - Teams are eliminated when all their units are destroyed
   - Scoreboard shows final rankings (1st place = winner, last place = first eliminated)

## Game Mechanics

### Units
- Each drawn pixel area spawns combat units
- Units have health, attack damage, speed, and attack range
- Units automatically target the nearest enemy unit
- Health bars appear when units take damage

### Combat
- Units move toward their target
- When in range, they attack automatically
- Combat continues until one team remains
- Visual attack lines show when units are fighting

### Strategy Tips
- Larger armies (more drawing) = more units
- Higher unit density = more concentrated forces
- Spread out units survive longer against focused attacks
- Corner positions can be defensive
- Multiple small groups can surround enemies

## Controls

- **Mouse**: Click and drag to draw
- **Touch**: Tap and swipe to draw (mobile friendly)
- **Brush Size**: 5-50 pixels
- **Unit Density**: 1-10 (higher = more units per stroke)
- **Clear Canvas**: Start over with a fresh canvas
- **Start Battle**: Begin the simulation
- **New Game**: Reset everything after a battle

## Technical Details

- Pure HTML5, CSS3, and JavaScript
- Canvas API for drawing and rendering
- Autonomous AI for unit behavior
- No external dependencies
- Mobile responsive design

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Tips for Best Experience

- Draw at least 2-3 teams for interesting battles
- Try different formations: lines, clusters, scattered
- Experiment with different unit densities
- Watch how positioning affects battle outcomes
- Create uneven teams to test different strategies

Enjoy the chaos!
