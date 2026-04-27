import './globals.css'

export const metadata = {
  title: 'Typing Speed Test',
  description: '타이핑 속도 테스트',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
