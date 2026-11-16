import Head from "next/head";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { PanierProvider } from "src/context/CartContext";
import Layout from "src/components/Layout";

const cacheEmotion = createCache({ key: "css", prepend: true });

const theme = createTheme({
  palette: {
    primary: { main: "#9155FD" },
    secondary: { main: "#8A8D93" },
  },
  typography: {
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
  },
});

const App = ({ Component, pageProps }) => (
  <CacheProvider value={cacheEmotion}>
    <Head>
      <title>Planète Tech — Boutique</title>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </Head>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PanierProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster position="bottom-center" />
      </PanierProvider>
    </ThemeProvider>
  </CacheProvider>
);

export default App;
