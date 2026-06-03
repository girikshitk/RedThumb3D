import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import logo from './assets/logo.png';

// Importing assets using Vite's glob import
const dioramaImages = import.meta.glob('./assets/products/Diorama/*.{png,jpg,jpeg,svg}', { eager: true });
const heroImages = import.meta.glob('./assets/products/HeroFigures/*.{png,jpg,jpeg,svg}', { eager: true });
const keychainImages = import.meta.glob('./assets/products/Keychains/*.{png,jpg,jpeg,svg}', { eager: true });
const mediumImages = import.meta.glob('./assets/products/MediumSizeFigures/*.{png,jpg,jpeg,svg}', { eager: true });
const miniatureImages = import.meta.glob('./assets/products/Miniatures/*.{png,jpg,jpeg,svg}', { eager: true });

const getImages = (globObj: any) => {
  return Object.entries(globObj).map(([path, module]: any) => ({
    name: path.split('/').pop()?.split('.')[0] || 'Product',
    src: module.default,
  }));
};

interface Product {
  name: string;
  src: string;
  size: string;
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className={`custom-cursor ${isClicking ? 'clicking' : ''}`} 
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    />
  );
};

const CharComponent = ({ char, className, style, canHover }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <span 
      className={`${className} ${isHovered && canHover ? 'hovered' : ''}`}
      style={style}
      onMouseEnter={() => canHover && setIsHovered(true)}
      onMouseLeave={() => canHover && setIsHovered(false)}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

const AnimatedText = ({ text, delayOffset = 0, triggerOnce = true, isMultiLine = false, canHover = false }: { text: string; delayOffset?: number; triggerOnce?: boolean, isMultiLine?: boolean, canHover?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01 });

    const current = domRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [triggerOnce]);

  const words = text.split(' ');
  let charCount = 0;

  return (
    <span ref={domRef} style={{ display: isMultiLine ? 'flex' : 'inline', flexDirection: 'column' }}>
      {words.map((word, wordIndex) => {
        const wordChars = word.split('');
        return (
          <span key={wordIndex} style={{ display: isMultiLine ? 'block' : 'inline' }}>
            {wordChars.map((char, charIndex) => {
              const delay = (charCount * 0.05) + delayOffset;
              charCount++;
              return (
                <CharComponent
                  key={`${wordIndex}-${charIndex}`} 
                  char={char}
                  className={`char ${isVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${delay}s` }}
                  canHover={canHover}
                />
              );
            })}
            {!isMultiLine && wordIndex < words.length - 1 && (
              <CharComponent 
                char=" " 
                className={`char ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${(charCount * 0.05) + delayOffset}s` }}
                canHover={false}
              />
            )}
            {charCount++ && ""} 
          </span>
        );
      })}
    </span>
  );
};

const SlideInText = ({ text, triggerOnce = true }: { text: string; triggerOnce?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01 });

    const current = domRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [triggerOnce]);

  return (
    <div ref={domRef} className={`slide-in-left ${isVisible ? 'visible' : ''}`}>
      {text}
    </div>
  );
};

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  
  // Custom Order State
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customOrderModalOpen, setCustomOrderModalOpen] = useState(false);
  const [customOrderData, setCustomOrderData] = useState({
    name: '',
    what: '',
    amount: '1',
    customAmount: '',
    height: '',
    unit: 'cm',
    productType: 'Diorama'
  });

  const categories = [
    { title: 'Diorama', size: '20-30cm', items: getImages(dioramaImages), multiLine: false },
    { title: 'Hero Figures', size: '25-30cm', items: getImages(heroImages), multiLine: true },
    { title: 'Medium Figures', size: '10-20cm', items: getImages(mediumImages), multiLine: true },
    { title: 'Miniatures', size: '5-7cm', items: getImages(miniatureImages), multiLine: false },
    { title: 'Keychains', size: '3-6cm', items: getImages(keychainImages), multiLine: false },
  ];

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setTimeout(() => setModalOpen(true), 10);
  };

  const handleCloseProduct = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 600);
  };

  const handleOpenCustomOrder = (type: string) => {
    setCustomOrderData(prev => ({ ...prev, productType: type }));
    setIsCustomOrderOpen(true);
    setTimeout(() => setCustomOrderModalOpen(true), 10);
  };

  const handleCloseCustomOrder = () => {
    setCustomOrderModalOpen(false);
    setTimeout(() => setIsCustomOrderOpen(false), 600);
  };

  const handleEmailRedirect = (toEmail: string = 'redthumb3d@gmail.com', isProductInquiry: boolean = false, product?: Product) => {
    let subject = '';
    let bodyText = '';

    if (isProductInquiry && product) {
      subject = encodeURIComponent(`Inquiry for ${product.name}`);
      bodyText = encodeURIComponent(`Hello RedThumb3D, I am interested in the ${product.name} (${product.size}). Could you please share the price and delivery details?\n\nThank you!`);
    } else {
      const { name, what, amount, customAmount, height, unit } = customOrderData;
      const finalAmount = amount === '26' ? customAmount : amount;
      const isBulk = amount === '26';
      
      subject = encodeURIComponent(name ? `Custom Order for ${what}` : `Inquiry for RedThumb3D`);
      bodyText = encodeURIComponent(name 
        ? (isBulk 
          ? `Hello I am ${name} and I want ${finalAmount}Units of ${what}and each with the height of ${height}${unit}, Thank you`
          : `Hello I am ${name} and I want ${finalAmount}Units of ${what} with the height of ${height}${unit}, Thank you`)
        : `Hello RedThumb3D team, I would like to inquire about...`);
    }
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${subject}&body=${bodyText}`;
    window.open(gmailUrl, '_blank');
  };

  const scrollToTop = () => {
    const duration = 1500;
    const start = window.pageYOffset;
    const startTime = performance.now();
    const cubicBezier = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = cubicBezier(progress);
      window.scrollTo(0, start * (1 - easeProgress));
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  };

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const WhyUsContent = () => (
    <div className="comparison-grid">
      <div className="comparison-card" style={{ background: 'var(--stark-white)', color: 'var(--black)' }}>
        <h2 className="massive-text" style={{ fontSize: '6rem', marginBottom: '2rem' }}>
          <AnimatedText text="IMPORTING" /><br/>
          <span style={{ fontSize: '0.7em', display: 'block', whiteSpace: 'nowrap' }}>
            <AnimatedText text="FROM CHINA" delayOffset={0.5} />
          </span>
        </h2>
        <div className="comparison-item"><span>Shipping</span> <span>20-45+ Days</span></div>
        <div className="comparison-item"><span>Import Duty</span> <span>42% - 77%</span></div>
        <div className="comparison-item"><span>Risk</span> <span>High</span></div>
      </div>
      <div className="comparison-card" style={{ background: 'var(--acid-green)', color: 'var(--black)' }}>
        <h2 className="massive-text" style={{ fontSize: '6rem', marginBottom: '2rem' }}>
          <AnimatedText text="REDTHUMB" /><br/>
          <AnimatedText text="3D" delayOffset={0.4} />
        </h2>
        <div className="comparison-item"><span>Shipping</span> <span>5-9 Days</span></div>
        <div className="comparison-item"><span>Import Duty</span> <span>0% - NONE</span></div>
        <div className="comparison-item"><span>Trends</span> <span>We know what will sell</span></div>
      </div>
    </div>
  );

  const toggleTicker = () => setIsTickerPaused(!isTickerPaused);

  return (
    <div className="app">
      <CustomCursor />
      
      {/* GLASSMORPHISM NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo" onClick={scrollToTop}>
          <img src={logo} alt="RedThumb3D Logo" />
        </div>
        <div className="nav-actions">
          <a href="#" className="email-btn" onClick={(e) => { e.preventDefault(); handleEmailRedirect(); }}>
            redthumb3d@gmail.com
          </a>
          <button className="nav-btn" onClick={scrollToFooter}>Contact Us</button>
        </div>
      </nav>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className={`modal ${modalOpen ? 'open' : ''}`}>
          <div className="back-arrow" onClick={handleCloseProduct}>
            ← BACK
          </div>
          <div className="modal-content">
            <div className="modal-image-container">
              <img src={selectedProduct.src} alt={selectedProduct.name} />
            </div>
            <div className="modal-info">
              <h1 className="massive-text acid-text" style={{ fontSize: '8rem' }}>{selectedProduct.name}</h1>
              <p className="massive-text" style={{ fontSize: '4rem', color: 'var(--stark-white)', marginBottom: '2rem' }}>
                {selectedProduct.size}
              </p>
              
              <div style={{ border: '2px solid var(--stark-white)', padding: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--acid-green)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>Why RedThumb3D?</p>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>Save 30+ days on shipping. Zero import duties. High-quality 3D prints made locally in India. We understand the market trends better than any importer.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <a href="tel:+918920153740" style={{ color: 'var(--acid-green)', fontSize: '1.5rem', fontWeight: '900', textDecoration: 'none' }}>+91 8920153740</a>
                <a href="tel:+919818479359" style={{ color: 'var(--acid-green)', fontSize: '1.5rem', fontWeight: '900', textDecoration: 'none' }}>+91 9818479359</a>
              </div>

              <button 
                style={{ width: '100%' }}
                onClick={() => handleEmailRedirect('redthumb3d@gmail.com', true, selectedProduct)}
              >
                Inquire Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ORDER MODAL */}
      {isCustomOrderOpen && (
        <div className={`modal ${customOrderModalOpen ? 'open' : ''}`}>
          <div className="back-arrow" onClick={handleCloseCustomOrder}>
            ← BACK
          </div>
          <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', padding: '4rem' }}>
            <div className="custom-modal-header">
              <select 
                className="brutal-select"
                value={customOrderData.productType}
                onChange={(e) => setCustomOrderData({...customOrderData, productType: e.target.value})}
              >
                {categories.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
              </select>
              <div className="contact-links-top">
                <a href="tel:+918920153740">+91 8920153740</a>
                <a href="tel:+919818479359">+91 9818479359</a>
              </div>
            </div>

            <h2 className="massive-text acid-text" style={{ fontSize: '6rem', marginBottom: '3rem' }}>Custom Order</h2>

            <input 
              className="brutal-input" 
              placeholder="YOUR NAME" 
              value={customOrderData.name}
              onChange={(e) => setCustomOrderData({...customOrderData, name: e.target.value})}
            />
            
            <input 
              className="brutal-input" 
              placeholder="WHAT DO YOU WANT?" 
              value={customOrderData.what}
              onChange={(e) => setCustomOrderData({...customOrderData, what: e.target.value})}
            />

            <div className="slider-container">
              <p style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: '1rem' }}>
                AMOUNT: {customOrderData.amount === '26' ? '25+' : customOrderData.amount}
              </p>
              <input 
                type="range" 
                min="1" 
                max="26" 
                className="brutal-slider"
                value={customOrderData.amount}
                onChange={(e) => setCustomOrderData({...customOrderData, amount: e.target.value})}
              />
            </div>

            {customOrderData.amount === '26' && (
              <input 
                className="brutal-input" 
                placeholder="SPECIFY AMOUNT" 
                value={customOrderData.customAmount}
                onChange={(e) => setCustomOrderData({...customOrderData, customAmount: e.target.value})}
              />
            )}

            <div className="unit-selector">
              <input 
                className="brutal-input" 
                type="number"
                placeholder="HEIGHT" 
                style={{ width: '200px' }}
                value={customOrderData.height}
                onChange={(e) => setCustomOrderData({...customOrderData, height: e.target.value})}
              />
              <select 
                className="brutal-select"
                style={{ marginBottom: '2rem', height: '50px' }}
                value={customOrderData.unit}
                onChange={(e) => setCustomOrderData({...customOrderData, unit: e.target.value})}
              >
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="m">m</option>
                <option value="foot">foot</option>
                <option value="inch">inch</option>
              </select>
            </div>

            <button 
              style={{ marginTop: '2rem', width: '100%', fontSize: '2rem' }}
              onClick={() => handleEmailRedirect()}
            >
              Go to Email
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <header className="brutal-border" style={{ padding: '12rem 2rem 4rem', textAlign: 'center' }}>
        <h1 id="hero-main-title" className="massive-text acid-text" style={{ fontSize: '27rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span><AnimatedText text="RED" canHover={true} /></span>
          <span><AnimatedText text="THUMB" delayOffset={0.2} canHover={true} /></span>
        </h1>
        <p style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5em', marginTop: '1rem' }}>
          3D PRINTING • CATALOGUE 2026 • INDIA
        </p>
      </header>

      {/* TICKER */}
      <div 
        className={`ticker ${isTickerPaused ? 'paused' : ''}`}
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
        onTouchStart={toggleTicker}
      >
        <div className="ticker-content">
          STOP IMPORTING FROM CHINA • 5-9 DAYS SHIPPING • NO IMPORT DUTIES • TRENDING NOW • +91 8920153740 • +91 9818479359 • STOP IMPORTING FROM CHINA • 5-9 DAYS SHIPPING • NO IMPORT DUTIES • TRENDING NOW • +91 8920153740 • +91 9818479359 •
        </div>
      </div>

      {/* CATALOGUE SECTIONS */}
      {categories.map((cat) => (
        <section key={cat.title}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <h2 className="massive-text acid-text" style={{ fontSize: cat.multiLine ? '12rem' : '8rem' }}>
              <AnimatedText text={cat.title.toUpperCase()} isMultiLine={cat.multiLine} />
            </h2>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--deep-red)' }}>{cat.size}</span>
          </div>
          <div className="grid-layout">
            {cat.items.map((item, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ cursor: 'zoom-in' }}
                onClick={() => handleOpenProduct({ ...item, size: cat.size })}
              >
                <img src={item.src} alt={item.name} />
                <h3 style={{ fontSize: '1.2rem', marginTop: '1rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--acid-green)', fontWeight: 'bold' }}>View Details</p>
              </div>
            ))}
            {/* Custom Order Card */}
            <div className="custom-order-card" onClick={() => handleOpenCustomOrder(cat.title)}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900' }}>MAKE A CUSTOM {cat.title.toUpperCase()}</h3>
              <p style={{ marginTop: '1rem', fontWeight: '900' }}>Click to Start</p>
            </div>
          </div>
        </section>
      ))}

      {/* WHY US SECTION - NOW AT THE BOTTOM */}
      <section id="why-us" style={{ padding: 0 }}>
        <h2 className="massive-text" style={{ padding: '2rem', borderBottom: '4px solid white' }}>
          <SlideInText text="WHY US?" />
        </h2>
        <WhyUsContent />
      </section>

      {/* FOOTER */}
      <footer ref={footerRef} className="brutal-border" style={{ padding: '6rem 2rem', background: 'var(--deep-red)', color: 'white', textAlign: 'center' }}>
        <h2 className="massive-text" style={{ fontSize: '12rem' }}>Order Now</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '4rem' }}>
          <a href="tel:+918920153740" style={{ fontSize: '5rem', fontWeight: '900', color: 'white', textDecoration: 'none', borderBottom: '8px solid white' }}>
            +91 8920153740
          </a>
          <a href="tel:+919818479359" style={{ fontSize: '5rem', fontWeight: '900', color: 'white', textDecoration: 'none', borderBottom: '8px solid white' }}>
            +91 9818479359
          </a>
        </div>
        <p style={{ marginTop: '4rem', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Single Collectors & Bulk Orders Welcome
        </p>
      </footer>
    </div>
  );
};

export default App;
