/* BOTTONE TORNA SU - stile neutro che segue il tema */
#scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s, background 0.2s, transform 0.2s;
  box-shadow: var(--shadow);
  border: 1px solid rgba(128, 128, 128, 0.3);
  z-index: 100;
  user-select: none;
}

#scroll-to-top.show {
  opacity: 1;
  visibility: visible;
}

#scroll-to-top:hover {
  background-color: var(--accent-color);
  color: white;
  transform: scale(1.05);
  border-color: transparent;
}

@media (max-width: 768px) {
  #scroll-to-top {
    width: 40px;
    height: 40px;
    font-size: 24px;
    bottom: 15px;
    right: 15px;
  }
}
