import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 다크모드 초기화 (CSS와 동기화)
if (localStorage.getItem('sp_dark_mode') === '1') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// PWA 서비스 워커 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW 등록 실패는 무시 (개발 환경)
    })
  })
}
