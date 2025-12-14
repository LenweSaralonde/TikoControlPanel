import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { ErrorBoundary } from "src/components/ErrorBoundary";
import { setupGlobalErrorHandlers } from "src/utils/errorHandling";
import "src/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <>
      <Head>
        <title>Tiko UI</title>

        {/* Viewport configuration */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui"
        />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
