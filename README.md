# 🌍 Radio Globe - Cyber Transmission Map

An interactive 3D globe showcasing underground radio stations around the world with a retro-futuristic 90's hacker/NASA aesthetic.

![Status](https://img.shields.io/badge/status-prototype-ff00ff) ![License](https://img.shields.io/badge/license-MIT-00ffff)

## 🎨 Features

- **Interactive 3D Globe** - Rotate, zoom, and explore with mouse controls
- **Neon Aesthetic** - Cyberpunk wireframe design with glowing markers
- **Radio Stations** - Click markers to view station info (fictitious data for now)
- **Retro Effects** - CRT scanlines and glitch animations
- **Auto-Rotate Mode** - Watch the globe spin autonomously
- **Responsive Design** - Works on desktop browsers

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/radio-globe.git
cd radio-globe
```

2. Open `index.html` in your browser
   - Simply double-click the file, or
   - Use a local server: `python -m http.server 8000`

3. Navigate to `http://localhost:8000`

### GitHub Pages Deployment

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Radio Globe prototype"
git branch -M main
git remote add origin https://github.com/yourusername/radio-globe.git
git push -u origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Select "main" branch as source
   - Your site will be live at `https://yourusername.github.io/radio-globe/`

## 🎮 Controls

- **Drag** - Rotate the globe
- **Scroll** - Zoom in/out
- **Click markers** - View radio station info
- **AUTO ROTATE** - Toggle automatic rotation
- **RESET VIEW** - Return to default view
- **WIREFRAME** - Adjust wireframe opacity

## 🗂️ Project Structure

```
radio-globe/
├── index.html          # Main HTML structure
├── app.js             # Three.js logic & radio station data
├── README.md          # Project documentation
└── LICENSE            # MIT License
```

## 📊 Radio Stations Data

Currently using fictitious radio stations for prototype. Data structure in `app.js`:

```javascript
{
    name: "Station Name",
    lat: 45.5017,           // Latitude
    lng: -73.5673,          // Longitude
    genre: "Genre • Style",
    city: "City",
    country: "Country",
    url: "https://stream.url"
}
```

### Adding Your Own Stations

Edit the `radioStations` array in `app.js`:

```javascript
const radioStations = [
    { 
        name: "Your Radio Name", 
        lat: 40.7128, 
        lng: -74.0060, 
        genre: "Your Genre", 
        city: "New York", 
        country: "USA", 
        url: "https://your-stream.com" 
    },
    // Add more stations...
];
```

## 🎨 Customization

### Colors

Main color scheme defined in `index.html` CSS:
- Primary: `#0f0` (green)
- Secondary: `#0ff` (cyan)
- Accent: `#f0f` (magenta)

### Globe Appearance

In `app.js`, modify `createGlobe()` function:
```javascript
const material = new THREE.MeshPhongMaterial({
    color: 0x001a1a,        // Base color
    wireframe: true,
    opacity: 0.3,           // Transparency
    emissive: 0x00ffff,     // Glow color
});
```

## 🔧 Tech Stack

- **Three.js** (r128) - 3D graphics
- **Vanilla JavaScript** - No frameworks
- **Pure CSS** - Retro terminal styling
- **No build process** - Runs directly in browser

## 🌟 Roadmap

- [ ] Real audio streaming integration
- [ ] Filter stations by genre
- [ ] Search functionality
- [ ] Mobile touch controls
- [ ] Social sharing
- [ ] User-submitted stations
- [ ] Currently playing indicators
- [ ] Particle effects on active streams
- [ ] Time zone indicators
- [ ] Dark/light mode toggle (cyber themes)

## 🎵 Inspiration

Inspired by:
- [Radio.Garden](https://radio.garden)
- 90's hacker movies aesthetics
- NASA mission control interfaces
- Underground radio culture
- Cyberpunk visual language

## 📝 License

MIT License - Feel free to use, modify, and distribute

## 👤 Author

Created by Kim Maurice
- Portfolio: [kimmaurice.com](https://kimmaurice.com)
- Instagram: [@thisisweirdai](https://instagram.com/thisisweirdai)

## 🤝 Contributing

This is a personal project but feedback and suggestions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🐛 Known Issues

- Audio streaming is placeholder only
- Performance may vary on older devices
- Mobile controls need optimization

## 💡 Tips

- Use Chrome or Firefox for best performance
- Hold Shift while dragging for faster rotation
- Zoom in close to see marker details
- Let auto-rotate run for the full cyberpunk effect

---

**Built with 💚 for the underground radio community**

*"Broadcasting from the digital underground"*
