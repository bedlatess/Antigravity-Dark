import '../global.css'; // 修正路径：指向上一层目录的 global.css
import { Providers } from '@/components/providers';
import { CurrencyFloat } from '@/components/CurrencyFloat';

export const metadata = {
  title: 'Komari Monitor',
  description: 'A simple server monitor tool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="relative min-h-screen">
        <Providers>
          {/* 动态背景层 */}
          <div 
            id="global-bg"
            className="fixed inset-0 z-[-2] bg-cover bg-center no-repeat transition-opacity duration-700"
          />
          {/* 半透明压暗层 */}
          <div className="fixed inset-0 z-[-1] bg-black/30 backdrop-brightness-75" />
          
          <main className="relative z-10 container mx-auto px-4 py-8">
            {children}
          </main>

          {/* 全局挂载汇率悬浮组件 */}
          <CurrencyFloat />
        </Providers>
      </body>
    </html>
  );
}