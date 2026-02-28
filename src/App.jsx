import React, { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from 'html2canvas';
import "./App.css";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const articleRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (image) URL.revokeObjectURL(image);
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
      setImage(null);
    }
  };

  const shareNewspaper = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const footer = document.querySelector('.article-footer');
      const wasVisible = footer?.style.display;
      if (footer) footer.style.display = 'none';

      const canvas = await html2canvas(articleRef.current, {
        backgroundColor: '#ebe7e7',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        onclone: (doc) => {
          doc.querySelectorAll('.article-image img, .img').forEach(img => {
            img.style.filter = 'grayscale(100%) contrast(160%) brightness(95%) sepia(10%)';
          });
        }
      });

      const ctx = canvas.getContext('2d');
      ctx.filter = 'grayscale(100%) contrast(160%) brightness(95%) sepia(10%)';
      ctx.drawImage(canvas, 0, 0);

      canvas.toBlob(async (blob) => {
        const newspaperFile = new File([blob], 'FakeTimes.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [newspaperFile] })) {
          try {
            await navigator.share({
              title: `${title || "FakeTimes"}`,
              text: `I made this epic fake newspaper using FakeTimes!\nCreate yours:`,
              files: [newspaperFile],
              url: window.location.href
            });
          } catch (shareError) {
            alert("Not able to share currently");
          }
        } else {
          alert("Not able to share currently");
        }
      }, 'image/png', 0.95);

    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
      if (document.querySelector('.article-footer')) {
        document.querySelector('.article-footer').style.display = '';
      }
    }
  }, [isSharing, title]);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  return (
    <div className="app-container">
      <div className="editor-panel">
        <h2 className="editor-title">FakeTimes Editor</h2>
        <input
          type="text"
          placeholder="Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="editor-input headline-input"
        />
        <textarea
          placeholder="Article content"
          rows="10"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
        />
        <div className="image-upload-container">
          <input type="file" accept="image/*" onChange={handleImage} className="editor-file-input" />
          {image && <button onClick={removeImage} className="remove-image-btn" title="Remove image">×</button>}
        </div>
      </div>

      <div className="preview-panel">
        <article ref={articleRef} className="article-preview">
          <header className="article-header">
            <h1 className="newspaper-title"><img src="./Titleimg.png" className="img" /> FakeTimes <img src="./Titleimg.png" className="img" /></h1>
            <p className="newspaper-tagline">All the news that never happened</p>
          </header>
          <h2 className="article-headline">{title || "Your Headline Here"}</h2>
          {image && (
            <figure className="article-image">
              <img src={image} alt="news" />
            </figure>
          )}
          <section className="article-content">
            {content || "Start typing your article..."}
          </section>
          <footer className="article-footer">
            <button onClick={shareNewspaper} className="share-btn" disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share Newspaper'}
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
