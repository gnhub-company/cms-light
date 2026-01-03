# 🚀 CMS-Light - Free Version

A powerful, modern Content Management System built with Next.js 16 and React 19. This is the **free version** of our premium CMS-Light platform, offering essential features for building and managing beautiful websites.

## ✨ Features

### 🎨 **Visual Design System**

- **Theme Manager**: Real-time color customization with live preview
- **Typography Control**: Custom fonts, sizes, and weights
- **Color Palette**: Brand colors, backgrounds, and text colors
- **Dark Mode Support**: Built-in dark/light mode toggle

### 📱 **Header Variations**

- **6 Header Styles**: Transparent, Background, Center, Floating, Sidebar, Fullscreen
- **Responsive Design**: Mobile-first approach
- **Logo Management**: Upload and customize logos
- **Menu Builder**: Dynamic navigation menus

### 🖼️ **Media Management**

- **Cloudinary Integration**: Professional image hosting
- **Pexels Integration**: Access millions of stock photos
- **Media Library**: Upload, organize, and manage assets
- **Image Optimization**: Automatic resizing and compression

### 📝 **Content Management**

- **Rich Text Editor**: WYSIWYG editor with HTML mode
- **Page Builder**: Drag-and-drop section builder
- **Dynamic Sections**: Hero, Features, FAQ, Contact forms
- **SEO Optimization**: Meta tags and structured data

### 🛠️ **Developer Features**

- **Next.js 16**: Latest React framework
- **Tailwind CSS 4**: Modern utility-first CSS
- **API Routes**: RESTful backend endpoints
- **File-based Routing**: Automatic page generation
- **TypeScript Ready**: Full type support

### 📊 **Analytics & Settings**

- **Site Configuration**: Title, tagline, favicon, contact info
- **Google Maps Integration**: Embedded location maps
- **Contact Forms**: Built-in form handling
- **Footer Builder**: Customizable footer layouts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cms-light.git
cd cms-light
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your API keys:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PEXELS_API_KEY=your_pexels_key
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cms-light/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API endpoints
│   │   ├── dashboard/      # Admin dashboard
│   │   └── [slug]/         # Dynamic pages
│   ├── components/         # React components
│   │   ├── ThemeManager.jsx
│   │   ├── HeaderManager.jsx
│   │   ├── MediaLibrary.jsx
│   │   └── ...
│   ├── data/              # JSON data files
│   └── styles/            # CSS styles
├── public/                # Static assets
└── package.json
```

## 🎯 Usage

### Admin Dashboard

Access the admin panel at `/dashboard` to:

- Customize themes and colors
- Manage headers and navigation
- Upload and organize media
- Configure site settings
- Build pages with sections

### Theme Customization

```javascript
// Real-time color updates
const colors = {
  primary: "#2196F3",
  accent: "#42A5F5",
  heading: "#1A1A1A",
  background: "#F5F5F5",
};
```

### Adding New Pages

```javascript
// Create dynamic pages
const newPage = {
  name: "About",
  slug: "/about",
  sections: [
    {
      heading: "About Us",
      description: "Your content here",
      bgType: "image",
    },
  ],
};
```

## 🔧 Configuration

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and secret
3. Add to `.env.local`

### Pexels Integration

1. Get API key from [Pexels](https://www.pexels.com/api/)
2. Add `PEXELS_API_KEY` to environment variables

## 📱 Responsive Design

CMS-Light is built mobile-first with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Customization

### Adding Custom Components

```jsx
// src/components/CustomSection.jsx
export default function CustomSection({ data }) {
  return (
    <section className="py-16">
      <h2>{data.heading}</h2>
      <p>{data.description}</p>
    </section>
  );
}
```

### Custom Styling

```css
/* Add to globals.css */
.custom-theme {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
# Deploy dist folder
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🆚 Free vs Premium

| Feature                                   | Free Version | Premium Version |
| ----------------------------------------- | ------------ | --------------- |
| Theme Manager                             | ✅           | ✅              |
| Media Library                             | ✅           | ✅              |
| Page Builder                              | ✅           | ✅              |
| SEO                                       | ❌           | ✅              |
| JSON-LD                                   | ❌           | ✅              |
| Google Anayltics                          | ❌           | ✅              |
| Toggle Theme Logo                         | ❌           | ✅              |
| Active Menu Color                         | ❌           | ✅              |
| CTA Button                                | ❌           | ✅              |
| Duplicate Pages                           | ❌           | ✅              |
| Duplicate Sections                        | ❌           | ✅              |
| Features Sections (Card, Block & Simple ) | ❌           | ✅              |
| Element Animation                         | ❌           | ✅              |
| Parallax Effect                           | ❌           | ✅              |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<!-- ## 🆘 Support

- 📧 **Email**: support@cms-light.com
- 💬 **Discord**: [Join our community](https://discord.gg/cms-light)
- 📖 **Documentation**: [docs.cms-light.com](https://docs.cms-light.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/cms-light/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Cloudinary](https://cloudinary.com) - Image management
- [Pexels](https://pexels.com) - Stock photos
- [Lucide React](https://lucide.dev) - Icons -->

<!-- ## 🔗 Links

- **Live Demo**: [cms-light-demo.vercel.app](https://cms-light-demo.vercel.app)
- **Premium Version**: [cms-light.com](https://cms-light.com)
- **Documentation**: [docs.cms-light.com](https://docs.cms-light.com) -->

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by Generation Next