import './globals.css';

export const metadata = {
  title: 'AI Code Improvement Advisor',
  description: 'Get AI-driven code improvement suggestions and refactoring advice for your GitHub repositories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
