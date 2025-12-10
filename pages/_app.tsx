import type { AppProps } from "next/app";
import Head from "next/head";
import "src/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
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
      <Component {...pageProps} />
    </>
  );
}
