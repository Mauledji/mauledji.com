// App.tsx
import ReactLenis from "lenis/react";
import LoadScreen from './components/common/LoadScreen';
import CustomCursor from './components/layout/CustomCursor';
import Header from './components/layout/Header';
import StarsBackground from './components/layout/StarsBackground';
import Expertise from "./components/sections/Expertise";
import Home from "./components/sections/Home";

function App() {
  const showLoadScreen = false;
  return (
    <>
      <Header />

      <ReactLenis root className="relative min-h-screen w-screen overflow-x-hidden">
        <CustomCursor />
        {showLoadScreen && <LoadScreen />}
        <StarsBackground />

        <Home />
        <section className="min-h-screen"></section>
        <Expertise />
        <section id="experience" className="min-h-screen"></section>
        <section id="work" className="min-h-screen"></section>
        <section className="min-h-screen"></section>
        <section className="min-h-screen"></section>
        <section className="min-h-screen"></section>
      </ReactLenis>
    </>

  )
}

export default App